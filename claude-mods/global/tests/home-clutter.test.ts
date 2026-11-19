import { expect, test } from 'claude-code/testing'

import { createdPaths, homeEntry, resolvePath } from '../hooks/home-clutter'

const H = '/Users/j'

test('home clutter: paths resolve against cwd and home', async () => {
  expect(resolvePath('~/social-drafts/x.md', '/tmp', H)).toBe('/Users/j/social-drafts/x.md')
  expect(resolvePath('../claude-skills-wt-x', '/Users/j/claude-skills', H)).toBe('/Users/j/claude-skills-wt-x')
  expect(homeEntry('/Users/j/mockups/a/index.html', H)).toBe('/Users/j/mockups')
  expect(homeEntry('/Users/j', H)).toBe(null)
  expect(homeEntry('/tmp/x', H)).toBe(null)
})

test('home clutter: what a shell line would create', async () => {
  expect(createdPaths('mkdir -p ~/newsletter-drafts/assets', '/x', H)).toEqual(['/Users/j/newsletter-drafts/assets'])
  expect(createdPaths('git worktree add ../claude-skills-wt-social -b s', '/Users/j/claude-skills', H)).toEqual(['/Users/j/claude-skills-wt-social'])
  expect(createdPaths('cd ~ && git clone https://github.com/sherlock-project/sherlock.git', '/x', H)).toEqual(['/Users/j/sherlock'])
  expect(createdPaths('git -C ~/Documents/dev clone git@github.com:a/b.git', '/x', H)).toEqual(['/Users/j/Documents/dev/b'])
  expect(createdPaths('ssh host "mkdir ~/x"', '/x', H)).toEqual([])
  expect(createdPaths('ls ~ && git status', H, H)).toEqual([])
})
