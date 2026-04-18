import type { BlackjackState, BlackjackAction } from './logic'
import { handScore } from './logic'

export function getAIAction(state: BlackjackState): BlackjackAction {
  const score = handScore(state.playerHand)
  if (score < 17) return { type: 'hit' }
  return { type: 'stand' }
}
