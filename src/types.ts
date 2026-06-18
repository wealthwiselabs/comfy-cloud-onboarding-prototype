// Single source of truth for shared types across all three bets.

export type Role =
  | 'visual_artist'
  | 'film_vfx'
  | 'game_artist'
  | 'marketing'
  | 'product_ecom'
  | 'developer'
  | 'student'
  | 'hobbyist'
  | 'other'

/** The concrete job picked in Step 2 of intake. */
export type UseCase =
  | 'animate_still'
  | 'talking_avatar'
  | 'cinematic'
  | 'product_photo'
  | 'character_art'
  | 'enhance_restyle'
  | 'social_ad'

/** Which real editor template a use-case loads. */
export type Template = 'video' | 'image'
export type OutputType = 'image' | 'video' | 'product' | 'audio' | '3d'
export type Skill = 'beginner' | 'intermediate' | 'pro'

/** Skill maps to the editor surface a user is routed into (Bet 1). */
export type Branch = 'app' | 'guided' | 'nodes'

export interface Intake {
  role: Role | null
  roleOther: string // free text when role === 'other'
  useCase: UseCase | null
  output: OutputType | null // resolved modality (derived, or chosen via chips)
  skill: Skill | null
}

/** A craft option in Step 1. */
export interface RoleOption {
  id: Role
  label: string
}

/** A use-case card in Step 2. */
export interface UseCaseOption {
  id: UseCase
  label: string
  blurb: string
  thumb: string // gradient/media key (see UseCaseStep THUMB map)
  tags: string[] // chips overlaid on the card media
  media: string // filename in public/media (looping clip or image)
  mediaType: 'video' | 'image'
  modality: OutputType | null // null => ambiguous, resolved via chips
  ambiguous?: boolean
}

/** A starting workflow card in Build's Discovery step. */
export interface StartWorkflow {
  id: string
  title: string
  model: string
  nodeCount: number
  rating: number
  thumb: string // public/media filename
  mediaType: 'video' | 'image'
  template: Template // selects which graph loads (video -> I2V, image -> IMG)
  focus?: 'top' | 'center' // thumbnail object-position (default center)
  desc?: string // one-line description shown on the Templates-browser card
}

/** One step in the canned Build agent conversation (discriminated union). */
/** A faked node edit the agent applies (also drives the "edited" highlight). */
export interface NodeOverride {
  title?: string
  note?: string
  textValue?: string // replaces a node's text-param value (e.g. the prompt)
}

export type AgentStep =
  | { kind: 'guide'; text: string; targetNodeId: string; tool?: string; suggested?: string }
  | { kind: 'choice'; text: string; targetNodeId: string; chips: string[]; tool?: string }
  | {
      kind: 'suggest'
      text: string
      targetNodeId: string
      applyLabel: string
      tool?: string
      override: NodeOverride
    }

export type RunStatus = 'idle' | 'running' | 'done' | 'error'

/** An editable input exposed in the guided/app surfaces (the "fields-only" view). */
export interface WorkflowField {
  id: string
  label: string
  hint?: string
  kind: 'textarea' | 'image' | 'slider' | 'select'
  value: string | number
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: string[]
}

/** Semantic port/wire type — drives the ComfyUI-style port + wire colors. */
export type PortKind = 'model' | 'clip' | 'cond' | 'vae' | 'latent' | 'image'

/** A typed input port shown on a node's left edge. */
export interface NodePort {
  name: string
  kind: PortKind
}

/** An editable-looking widget row inside a node (stepper / dropdown / etc.). */
export interface NodeParam {
  name: string
  value: string
  control: 'stepper' | 'dropdown' | 'seed' | 'text'
}

/** A node in the faked Comfy graph (React Flow). */
export interface GraphNode {
  id: string
  title: string
  type: 'loader' | 'input' | 'sampler' | 'conditioning' | 'vae' | 'output' | 'model'
  note?: string // inline annotation for the post-aha reveal / education
  editable?: boolean // highlighted as a "what to edit" node
  ins?: NodePort[] // typed input ports (left edge)
  out?: { label: string; kind: PortKind } // typed output port (right edge) + header label
  params?: NodeParam[] // widget rows in the body
  advanced?: boolean // show the "Show advanced inputs" affordance
}
export interface GraphEdge {
  id: string
  source: string
  target: string
  targetHandle?: string // input port name on the target node
}

/** A labeled column of nodes in the faked graph, with a teaching caption. */
export interface GraphGroup {
  id: string
  label: string
  step: string
  nodeIds: string[]
  comment?: { title: string; body: string[] } // rich "Step N" comment card; body lines support **bold**
}

/** A flat comment on a Showroom item. */
export interface CommentItem {
  author: string
  avatar: string
  text: string
  time: string
}

export interface ShowroomItem {
  id: string
  title: string
  author: string
  avatar: string
  thumb: string // public/media filename (e.g. 'showroom-1.jpg') or 'result-video.mp4'
  kind: OutputType
  likes: number
  comments: number
  remixes: number
  liked?: boolean
  mine?: boolean
  model?: string // e.g. 'Wan 2.2' — shown on cards & lineage
  forkedFrom?: { id: string; author: string } // parent in the remix tree (undefined = original)
  featured?: boolean // staff-curated → Featured shelf + badge
  commentList?: CommentItem[] // the visible comments (count stays in `comments`)
}

export type WorkType = 'commissions' | 'freelance' | 'full-time'

export interface Creator {
  handle: string
  name: string
  avatar: string
  bio: string
  skills: string[] // e.g. ['Image-to-Video', 'Product']
  styles: string[] // e.g. ['Cinematic', 'Anime']
  openToWork: boolean
  workTypes: WorkType[]
  followers: number
  thumb: string // a representative work, public/media filename
  isYou?: boolean
}

export interface NotificationItem {
  id: string
  kind: 'like' | 'comment' | 'follow' | 'post' | 'remix' | 'commission'
  text: string
  time: string
  read?: boolean
}

export interface Lesson {
  id: string
  concept: string // e.g. "VAE"
  blurb: string
  reward: number // credits earned
  done?: boolean
}
