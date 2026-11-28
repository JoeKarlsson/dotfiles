"""python3 ~/.claude/social-review-gate.test.py"""
import importlib.util
import json
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('gate', Path(__file__).with_name('social-review-gate.py'))
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


def call(name, **args):
    return json.dumps({'type': 'assistant', 'message': {'content': [{'type': 'tool_use', 'name': name, 'input': args}]}})


DRAFT = '/Users/joekarlsson/claude-skills/drafts/social/2026-12-14-x.md'


class Gate(unittest.TestCase):
    def test_draft_written_with_no_review_blocks(self):
        self.assertTrue(gate.unreviewed([call('Write', file_path=DRAFT, content='x')]))

    def test_review_after_the_last_edit_passes(self):
        self.assertFalse(gate.unreviewed([call('Edit', file_path=DRAFT),
                                          call('Agent', subagent_type='reader-reviewer', prompt='p')]))

    def test_edit_after_the_review_blocks_again(self):
        self.assertTrue(gate.unreviewed([call('Write', file_path=DRAFT),
                                         call('Agent', subagent_type='reader-reviewer', prompt='p'),
                                         call('Bash', command=f"sed -i '' 's/a/b/' {DRAFT}")]))

    def test_reading_or_dry_running_a_draft_does_not_count_as_a_write(self):
        self.assertFalse(gate.unreviewed([call('Read', file_path=DRAFT),
                                          call('Bash', command=f'python3 scripts/social/postiz-schedule.py {DRAFT} 2026-12-14 --dry-run'),
                                          call('Bash', command='python3 scripts/approval_lock.py approve ' + DRAFT)]))

    def test_listing_drafts_by_glob_in_a_command_that_writes_elsewhere_is_not_a_draft_write(self):
        # Context audit 2026-11-27: write_text on a test file plus `ls drafts/social/*.md` blocked the stop
        self.assertFalse(gate.unreviewed([call('Bash', command="python3 - <<'EOF'\np.write_text(s)\nEOF\nls drafts/social/*.md | head -1")]))

    def test_other_files_and_other_agents_are_ignored(self):
        self.assertFalse(gate.unreviewed([call('Write', file_path='/Users/joekarlsson/notes.md'),
                                          call('Agent', subagent_type='Explore', prompt='p')]))


if __name__ == '__main__':
    unittest.main()
