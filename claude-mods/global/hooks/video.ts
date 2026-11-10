// The video pipeline (~/.claude/skills: video, video-script-writer, video-clips) is
// global. Slash commands skip prompt hooks, so /video needs nothing here; this
// catches asking for a script or for clips in plain words, which otherwise starts
// the work without loading the skill. marketing.ts's prompt hook adds the note,
// since a mod gets one prompt.submit hook.

export type VideoTopic = { key: string; re: RegExp }

export const VIDEO_TOPICS: VideoTopic[] = [
  {
    key: 'script',
    re: /\b(video|youtube|shorts?|reels?|tiktok) scripts?\b|\bscript (for|of) (a |my |the |this )?(video|youtube|short|reel)\b|\bturn (this|it|that)\b[^.?!\n]{0,40}\binto an? (video|short|reel|youtube)\b|\b(write|draft)\b[^.?!\n]{0,20}\b(a|my|the|this) (youtube |short |explainer |demo )?video\b/i,
  },
  {
    key: 'clips',
    re: /\b(pull|make|cut|pick|find|choose)\b[^.?!\n]{0,30}\b(clips|shorts|reels)\b|\bclips? (from|out of)\b[^.?!\n]{0,30}\b(video|recording|talk)\b/i,
  },
]

export function videoTopicsFor(text: string): VideoTopic[] {
  return VIDEO_TOPICS.filter(t => t.re.test(text))
}

export const videoNote = (topics: VideoTopic[]) =>
  topics
    .map(t =>
      t.key === 'script'
        ? 'Video (global mod): load the video skill (Skill tool, skill "video") and follow its phases. ' +
          "A video for CData's channel runs from ~/Documents/dev/cdata/skills, where it also loads video-cdata."
        : 'Video (global mod): load the video-clips skill (Skill tool, skill "video-clips") to pick the clips.',
    )
    .join(' ')
