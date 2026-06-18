import { create } from 'zustand'
import type {
  Intake,
  Role,
  OutputType,
  Skill,
  Branch,
  Template,
  UseCase,
  WorkflowField,
  RunStatus,
  ShowroomItem,
  NotificationItem,
  Lesson,
  Creator,
  WorkType,
  StartWorkflow,
} from '../types'
import {
  I2V_FIELDS,
  IMG_FIELDS,
  RUN_COST,
  IMG_RUN_COST,
  STARTING_CREDITS,
  SHOWROOM,
  NOTIFICATIONS,
  LESSONS,
  USE_CASES,
  CREATORS,
  PUBLISH_REWARD,
  TEMPLATE_MEDIA,
} from '../data/seed'

/** beginner → no-node app · intermediate → guided fields · pro → full graph */
export function branchForSkill(skill: Skill | null): Branch {
  if (skill === 'beginner') return 'app'
  if (skill === 'pro') return 'nodes'
  return 'guided'
}

interface State {
  // session
  signedIn: boolean
  intake: Intake
  credits: number
  activated: boolean // hit the activation event (successful edit-and-run)

  // hero workflow (Bet 1)
  fields: WorkflowField[]
  runStatus: RunStatus
  hasEditedField: boolean
  showNodes: boolean // guided branch: reveal the graph

  // Bet 3
  showroom: ShowroomItem[]
  notifications: NotificationItem[]

  // Bet 3 — profile + discovery
  profile: Creator
  searchAppearances: number
  profileViews: number
  pendingFork: { id: string; author: string } | null
  remixSource: { thumb: string; kind: OutputType } | null
  rewardToast: string | null

  // Bet 2 — templates browser + chosen workflow
  lessons: Lesson[]
  templatesOpen: boolean
  selectedWorkflow: StartWorkflow | null

  // actions
  signIn: () => void
  openTemplates: () => void
  closeTemplates: () => void
  pickWorkflow: (w: StartWorkflow) => void
  clearWorkflow: () => void
  setRole: (r: Role) => void
  setRoleOther: (text: string) => void
  setOutput: (o: OutputType) => void
  setUseCase: (u: UseCase) => void
  setSkill: (s: Skill) => void
  branch: () => Branch
  template: () => Template
  inputImage: () => string
  resultMedia: () => { src: string; type: 'video' | 'image' }
  loadTemplate: () => void
  clearRun: () => void
  editField: (id: string, value: string | number) => void
  startRun: () => void
  finishRun: () => void
  setShowNodes: (v: boolean) => void
  toggleLike: (id: string) => void
  addComment: (id: string, text: string) => void
  publishToShowroom: (title: string) => void
  completeLesson: (id: string) => void
  setOpenToWork: (v: boolean) => void
  toggleWorkType: (t: WorkType) => void
  remixItem: (item: ShowroomItem) => void
  clearReward: () => void
  reset: () => void
}

const initialIntake: Intake = {
  role: null,
  roleOther: '',
  useCase: null,
  output: null,
  skill: null,
}

export const useStore = create<State>((set, get) => ({
  signedIn: false,
  intake: initialIntake,
  credits: STARTING_CREDITS,
  activated: false,

  // TODO: load IMG_FIELDS when template() === 'image' (Studio wiring; out of scope for the wizard)
  fields: I2V_FIELDS.map((f) => ({ ...f })),
  runStatus: 'idle',
  hasEditedField: false,
  showNodes: false,

  showroom: SHOWROOM.map((s) => ({ ...s })),
  notifications: NOTIFICATIONS.map((n) => ({ ...n })),

  profile: { ...(CREATORS.find((c) => c.isYou) as Creator) },
  searchAppearances: 0,
  profileViews: 0,
  pendingFork: null,
  remixSource: null,
  rewardToast: null,

  lessons: LESSONS.map((l) => ({ ...l })),
  templatesOpen: false,
  selectedWorkflow: null,

  signIn: () => set({ signedIn: true }),
  openTemplates: () => set({ templatesOpen: true }),
  closeTemplates: () => set({ templatesOpen: false }),
  // pick a template from the modal -> point the editor at it and close the modal
  pickWorkflow: (w) => {
    get().setOutput(w.template)
    get().loadTemplate()
    set({ selectedWorkflow: w, templatesOpen: false })
  },
  clearWorkflow: () => set({ selectedWorkflow: null }),
  setRole: (role) =>
    set((s) => ({ intake: { ...s.intake, role }, remixSource: null })),
  setRoleOther: (roleOther) =>
    set((s) => ({ intake: { ...s.intake, roleOther } })),
  setOutput: (output) =>
    set((s) => ({ intake: { ...s.intake, output }, remixSource: null })),
  setUseCase: (useCase) =>
    set((s) => {
      const uc = USE_CASES.find((u) => u.id === useCase)
      return {
        intake: {
          ...s.intake,
          useCase,
          // ambiguous use-cases defer modality to the inline chips
          output: uc?.ambiguous ? null : uc?.modality ?? null,
        },
      }
    }),
  setSkill: (skill) => set((s) => ({ intake: { ...s.intake, skill } })),
  branch: () => branchForSkill(get().intake.skill),
  // video modality -> video template; everything else -> image template
  template: () => (get().intake.output === 'video' ? 'video' : 'image'),

  // a remixed image card shows its own image as the input; video remixes fall
  // back to the template's stock still (a card's video thumb can't be an <img>)
  inputImage: () => {
    const s = get()
    if (s.remixSource && s.remixSource.kind !== 'video') return s.remixSource.thumb
    return TEMPLATE_MEDIA[s.template()].input
  },
  // a remix reproduces the card's own output; otherwise the template's canned result
  resultMedia: () => {
    const s = get()
    if (s.remixSource) {
      return {
        src: s.remixSource.thumb,
        type: s.remixSource.kind === 'video' ? 'video' : 'image',
      }
    }
    const m = TEMPLATE_MEDIA[s.template()]
    return { src: m.result, type: m.resultType }
  },

  // load the editable fields for the active template (video -> I2V, image -> IMG)
  loadTemplate: () =>
    set({
      fields: (get().template() === 'video' ? I2V_FIELDS : IMG_FIELDS).map((f) => ({ ...f })),
      runStatus: 'idle',
      hasEditedField: false,
    }),
  clearRun: () => set({ runStatus: 'idle' }),

  editField: (id, value) =>
    set((s) => ({
      hasEditedField: true,
      fields: s.fields.map((f) => (f.id === id ? { ...f, value } : f)),
    })),

  startRun: () => set({ runStatus: 'running' }),
  finishRun: () =>
    set((s) => ({
      runStatus: 'done',
      credits: Math.max(
        0,
        s.credits - (get().template() === 'video' ? RUN_COST : IMG_RUN_COST),
      ),
      // activation = edited a field AND produced a successful output
      activated: s.hasEditedField,
    })),

  setShowNodes: (v) => set({ showNodes: v }),

  toggleLike: (id) =>
    set((s) => ({
      showroom: s.showroom.map((it) =>
        it.id === id
          ? { ...it, liked: !it.liked, likes: it.likes + (it.liked ? -1 : 1) }
          : it,
      ),
    })),

  addComment: (id, text) =>
    set((s) => ({
      showroom: s.showroom.map((it) =>
        it.id === id
          ? {
              ...it,
              comments: it.comments + 1,
              commentList: [
                { author: 'Eric', avatar: 'E', text, time: 'now' },
                ...(it.commentList ?? []),
              ],
            }
          : it,
      ),
    })),

  publishToShowroom: (title) =>
    set((s) => {
      const tmpl = get().template()
      return {
        credits: s.credits + PUBLISH_REWARD,
        rewardToast: `+${PUBLISH_REWARD} ✦ for publishing`,
        pendingFork: null,
        showroom: [
          {
            id: `mine-${Date.now()}`,
            title,
            author: 'Eric',
            avatar: 'E',
            thumb: TEMPLATE_MEDIA[tmpl].result,
            kind: s.intake.output ?? 'video',
            likes: 0,
            comments: 0,
            remixes: 0,
            mine: true,
            model: tmpl === 'video' ? 'Wan 2.2' : 'Flux',
            forkedFrom: s.pendingFork ?? undefined,
          },
          ...s.showroom,
        ],
      }
    }),

  setOpenToWork: (v) =>
    set((s) => ({
      profile: { ...s.profile, openToWork: v },
      // turning availability on makes you discoverable → seed the signal
      searchAppearances: v ? Math.max(s.searchAppearances, 12) : s.searchAppearances,
      profileViews: v ? Math.max(s.profileViews, 3) : s.profileViews,
    })),

  toggleWorkType: (t) =>
    set((s) => ({
      profile: {
        ...s.profile,
        workTypes: s.profile.workTypes.includes(t)
          ? s.profile.workTypes.filter((x) => x !== t)
          : [...s.profile.workTypes, t],
      },
    })),

  // "Remix in Cloud": stash the parent + load the editor in one atomic update
  // (inlines loadTemplate's logic to avoid a nested set()), component navigates to /studio
  remixItem: (item) =>
    set((s) => {
      const isVideo = item.kind === 'video'
      return {
        // adopt the remixed item's modality so the editor + result match the card
        intake: { ...s.intake, output: item.kind },
        fields: (isVideo ? I2V_FIELDS : IMG_FIELDS).map((f) => ({ ...f })),
        runStatus: 'idle',
        hasEditedField: false,
        pendingFork: { id: item.id, author: item.author },
        // carry the card's own media into the editor (input preview + result)
        remixSource: { thumb: item.thumb, kind: item.kind },
      }
    }),

  clearReward: () => set({ rewardToast: null }),

  completeLesson: (id) =>
    set((s) => {
      const lesson = s.lessons.find((l) => l.id === id)
      if (!lesson || lesson.done) return {}
      return {
        credits: s.credits + lesson.reward,
        lessons: s.lessons.map((l) => (l.id === id ? { ...l, done: true } : l)),
      }
    }),

  reset: () =>
    set({
      signedIn: false,
      intake: initialIntake,
      credits: STARTING_CREDITS,
      activated: false,
      fields: I2V_FIELDS.map((f) => ({ ...f })),
      runStatus: 'idle',
      hasEditedField: false,
      showNodes: false,
      profile: { ...(CREATORS.find((c) => c.isYou) as Creator) },
      searchAppearances: 0,
      profileViews: 0,
      pendingFork: null,
      remixSource: null,
      rewardToast: null,
      templatesOpen: false,
      selectedWorkflow: null,
    }),
}))
