import { Plugin } from "@opencode/plugin/tui"

function formatCost(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value) || value === 0) return "$0"
  if (value < 0.01) return `$${value.toFixed(4)}`
  if (value < 1) return `$${value.toFixed(3)}`
  return `$${value.toFixed(2)}`
}

export default Plugin.define({
  id: "joe.session-cost",
  setup(context) {
    return context.ui.slot({
      append: "prompt.footer.status",
      render: ({ sessionID }) => {
        if (!sessionID) return null
        const raw = context.data.session.cost(sessionID)
        const cost = typeof raw === "number" ? raw : (raw as { cost?: number } | undefined)?.cost
        return <text fg={context.theme.text.muted}>{formatCost(cost)}</text>
      },
    })
  },
})
