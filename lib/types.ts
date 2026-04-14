export type PlayerValue =
  | { type: 'existing'; id: string; display_name: string }
  | { type: 'new'; display_name: string }

export type SetScore = { my: number; opp: number }
