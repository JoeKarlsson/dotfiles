// obsbot-autotrack: every time an app starts using the OBSBOT Tiny 3, switch it
// to Human Tracking (Single Mode). The camera forgets its AI mode when it sleeps,
// so tracking was only on some of the time.
//
// Watches CoreMediaIO's "device is running somewhere" flag on every physical
// OBSBOT camera and, on each off -> on edge, sends the OSC command
// /OBSBOT/WebCam/Tiny/SetAiMode 0 (Tiny 3: 0 = Human Tracking, Single Mode) to
// OBSBOT Center, which must be running with OSC enabled (UDP, port 16284).
// Installed and run by launchd: see .chezmoiscripts/run_onchange_after_darwin-obsbot-autotrack.sh.tmpl
import AppKit
import CoreMediaIO
import Foundation

let oscPort: UInt16 = 16284
let centerBundleID = "com.obsbot.OBSBOT_Center"
// The camera can take a few seconds to wake from standby and accept commands,
// so resend a few times. SetAiMode is idempotent.
let sendDelays: [Double] = [1.5, 4, 8, 15]

func log(_ msg: String) {
    let ts = ISO8601DateFormatter().string(from: Date())
    print("\(ts) \(msg)")
    fflush(stdout)
}

func addr(_ selector: some BinaryInteger,
          _ scope: some BinaryInteger = kCMIOObjectPropertyScopeGlobal,
          _ element: some BinaryInteger = kCMIOObjectPropertyElementMain) -> CMIOObjectPropertyAddress {
    CMIOObjectPropertyAddress(mSelector: CMIOObjectPropertySelector(selector),
                              mScope: CMIOObjectPropertyScope(scope),
                              mElement: CMIOObjectPropertyElement(element))
}

// MARK: OSC over UDP

func oscPad(_ data: inout Data) {
    data.append(0)
    while data.count % 4 != 0 { data.append(0) }
}

func sendOSC(_ address: String, _ value: Int32) {
    var packet = Data(address.utf8); oscPad(&packet)
    var tags = Data(",i".utf8); oscPad(&tags); packet.append(tags)
    withUnsafeBytes(of: value.bigEndian) { packet.append(contentsOf: $0) }

    let fd = socket(AF_INET, SOCK_DGRAM, 0)
    guard fd >= 0 else { log("socket() failed"); return }
    defer { close(fd) }
    var sin = sockaddr_in()
    sin.sin_family = sa_family_t(AF_INET)
    sin.sin_port = oscPort.bigEndian
    sin.sin_addr.s_addr = inet_addr("127.0.0.1")
    let sent = packet.withUnsafeBytes { buf in
        withUnsafePointer(to: &sin) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                sendto(fd, buf.baseAddress, buf.count, 0, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }
    }
    if sent < 0 { log("sendto failed: errno \(errno)") }
}

func ensureCenterRunning() {
    if !NSRunningApplication.runningApplications(withBundleIdentifier: centerBundleID).isEmpty { return }
    log("OBSBOT Center not running, launching it")
    let p = Process()
    p.executableURL = URL(fileURLWithPath: "/usr/bin/open")
    p.arguments = ["-g", "-b", centerBundleID]
    try? p.run()
}

// MARK: Camera watching

func deviceName(_ id: CMIOObjectID) -> String {
    var a = addr(kCMIOObjectPropertyName)
    var name: Unmanaged<CFString>?
    var used: UInt32 = 0
    let status = CMIOObjectGetPropertyData(id, &a, 0, nil, UInt32(MemoryLayout<CFString?>.size), &used, &name)
    guard status == 0, let name else { return "" }
    return name.takeRetainedValue() as String
}

func isRunning(_ id: CMIOObjectID) -> Bool {
    var a = addr(kCMIODevicePropertyDeviceIsRunningSomewhere,
                 kCMIOObjectPropertyScopeWildcard, kCMIOObjectPropertyElementWildcard)
    var running: UInt32 = 0
    var used: UInt32 = 0
    CMIOObjectGetPropertyData(id, &a, 0, nil, 4, &used, &running)
    return running != 0
}

func allDevices() -> [CMIOObjectID] {
    var a = addr(kCMIOHardwarePropertyDevices)
    var size: UInt32 = 0
    CMIOObjectGetPropertyDataSize(CMIOObjectID(kCMIOObjectSystemObject), &a, 0, nil, &size)
    var ids = [CMIOObjectID](repeating: 0, count: Int(size) / MemoryLayout<CMIOObjectID>.size)
    CMIOObjectGetPropertyData(CMIOObjectID(kCMIOObjectSystemObject), &a, 0, nil, size, &size, &ids)
    return ids
}

var watched: [CMIOObjectID: Bool] = [:]  // device -> last known running state
var generation = 0  // bumps on every start so stale resends from an earlier start stop

func cameraStarted(_ name: String) {
    log("\(name) started, setting Human Tracking (Single Mode)")
    ensureCenterRunning()
    generation += 1
    let gen = generation
    for delay in sendDelays {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            guard gen == generation, watched.values.contains(true) else { return }
            sendOSC("/OBSBOT/WebCam/Tiny/SetAiMode", 0)
        }
    }
}

func scanDevices() {
    for id in allDevices() where watched[id] == nil {
        let name = deviceName(id)
        // Physical OBSBOT cameras only, not the OBSBOT Virtual Camera.
        guard name.contains("OBSBOT"), !name.contains("Virtual") else { continue }
        let running = isRunning(id)
        watched[id] = running
        log("watching \(name) (running: \(running))")
        var a = addr(kCMIODevicePropertyDeviceIsRunningSomewhere,
                     kCMIOObjectPropertyScopeWildcard, kCMIOObjectPropertyElementWildcard)
        CMIOObjectAddPropertyListenerBlock(id, &a, DispatchQueue.main) { _, _ in
            let now = isRunning(id)
            let was = watched[id] ?? false
            watched[id] = now
            if now && !was { cameraStarted(name) }
            if !now && was { log("\(name) stopped") }
        }
        if running { cameraStarted(name) }
    }
    let present = Set(allDevices())
    for id in watched.keys where !present.contains(id) { watched[id] = nil }
}

var devicesAddr = addr(kCMIOHardwarePropertyDevices)
CMIOObjectAddPropertyListenerBlock(CMIOObjectID(kCMIOObjectSystemObject), &devicesAddr, DispatchQueue.main) { _, _ in
    scanDevices()
}

log("obsbot-autotrack started")
scanDevices()
RunLoop.main.run()
