import { expect, test } from 'claude-code/testing'

import { videoNote, videoTopicsFor } from '../hooks/video'

const keys = (text: string) => videoTopicsFor(text).map(t => t.key)

test('script requests load the video skill', async () => {
  expect(keys('write a video script about MCP gateways')).toEqual(['script'])
  expect(keys('I need a YouTube script for the Kindle project')).toEqual(['script'])
  expect(keys('turn this blog post into a video')).toEqual(['script'])
  expect(keys('draft a demo video on the studio setup')).toEqual(['script'])
})

test('clip requests load video-clips', async () => {
  expect(keys('pull clips from the dots recording')).toEqual(['clips'])
  expect(keys('make Shorts out of my KubeCon talk')).toEqual(['clips'])
  expect(keys('what clips from this video would work?')).toEqual(['clips'])
})

test('everyday and homelab prompts do not trigger it', async () => {
  expect(keys('fix the Plex video transcoding errors')).toEqual([])
  expect(keys('why is Tdarr skipping this video file')).toEqual([])
  expect(keys('run the backup script')).toEqual([])
  expect(keys('write a test for the slugify script')).toEqual([])
})

test('the notes name the skills and the CData repo', async () => {
  const n = videoNote(videoTopicsFor('write a video script, then pull clips from it'))
  expect(n).toContain('skill "video"')
  expect(n).toContain('video-cdata')
  expect(n).toContain('skill "video-clips"')
})
