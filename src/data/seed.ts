import type {
  Role,
  OutputType,
  Template,
  WorkflowField,
  GraphNode,
  GraphEdge,
  GraphGroup,
  ShowroomItem,
  Creator,
  NotificationItem,
  Lesson,
  RoleOption,
  UseCaseOption,
  StartWorkflow,
  AgentStep,
} from '../types'

// ---- The hero template: Image → Video (Wan-style) ----------------------------

export const I2V_FIELDS: WorkflowField[] = [
  {
    id: 'image',
    label: 'Input image',
    hint: 'The still frame to bring to life',
    kind: 'image',
    value: 'sample-portrait',
  },
  {
    id: 'prompt',
    label: 'Motion prompt',
    hint: 'Describe how it should move',
    kind: 'textarea',
    value: 'slow cinematic push-in, hair and fabric drifting in a gentle breeze',
  },
  {
    id: 'length',
    label: 'Clip length',
    kind: 'slider',
    value: 5,
    min: 2,
    max: 8,
    step: 1,
    unit: 's',
  },
  {
    id: 'motion',
    label: 'Motion strength',
    kind: 'slider',
    value: 60,
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
  },
]

// Faked Comfy graph for the Image→Video workflow (positions set in the canvas component).
export const I2V_NODES: GraphNode[] = [
  {
    id: 'load-model', title: 'Load Diffusion Model', type: 'model',
    out: { label: 'MODEL', kind: 'model' }, advanced: true,
    params: [
      { name: 'unet_name', value: 'wan2.2_i2v_A14B.safetensors', control: 'dropdown' },
      { name: 'weight_dtype', value: 'fp8_e4m3fn', control: 'dropdown' },
    ],
    note: 'The video model. Diffusion = denoise random noise into frames step by step.',
  },
  {
    id: 'load-img', title: 'Load Image', type: 'input', editable: true,
    out: { label: 'IMAGE', kind: 'image' },
    params: [{ name: 'image', value: 'input_still.png', control: 'dropdown' }],
    note: 'Your input frame — the one field most people change.',
  },
  {
    id: 'clip', title: 'CLIP Text Encode (Prompt)', type: 'conditioning', editable: true,
    ins: [{ name: 'clip', kind: 'clip' }], out: { label: 'CONDITIONING', kind: 'cond' },
    params: [{ name: 'text', value: 'slow cinematic push-in, hair and fabric drifting in a gentle breeze', control: 'text' }],
    note: 'Turns your motion prompt into guidance the model understands.',
  },
  {
    id: 'czo', title: 'ConditioningZeroOut', type: 'conditioning',
    ins: [{ name: 'conditioning', kind: 'cond' }], out: { label: 'CONDITIONING', kind: 'cond' },
    note: 'A blank negative prompt — what you do NOT want.',
  },
  {
    id: 'sampler', title: 'KSampler', type: 'sampler',
    ins: [
      { name: 'model', kind: 'model' },
      { name: 'positive', kind: 'cond' },
      { name: 'negative', kind: 'cond' },
      { name: 'latent_image', kind: 'latent' },
    ],
    out: { label: 'LATENT', kind: 'latent' },
    params: [
      { name: 'seed', value: '22267814503', control: 'seed' },
      { name: 'steps', value: '8', control: 'stepper' },
      { name: 'cfg', value: '1.0', control: 'stepper' },
      { name: 'sampler_name', value: 'res_multistep', control: 'dropdown' },
      { name: 'scheduler', value: 'simple', control: 'dropdown' },
      { name: 'denoise', value: '1.00', control: 'stepper' },
    ],
    note: 'Runs the denoising steps. More steps = cleaner, slower, pricier.',
  },
  {
    id: 'vae', title: 'VAE Decode', type: 'vae',
    ins: [{ name: 'samples', kind: 'latent' }, { name: 'vae', kind: 'vae' }],
    out: { label: 'IMAGE', kind: 'image' },
    note: 'VAE converts the math (latents) back into actual pixels.',
  },
  {
    id: 'out', title: 'Save Video', type: 'output',
    ins: [{ name: 'images', kind: 'image' }],
    params: [{ name: 'filename_prefix', value: 'ComfyUI', control: 'dropdown' }],
    note: 'Your finished clip.',
  },
]

export const I2V_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'load-model', target: 'sampler', targetHandle: 'model' },
  { id: 'e2', source: 'clip', target: 'sampler', targetHandle: 'positive' },
  { id: 'e3', source: 'clip', target: 'czo', targetHandle: 'conditioning' },
  { id: 'e4', source: 'czo', target: 'sampler', targetHandle: 'negative' },
  { id: 'e5', source: 'load-img', target: 'sampler', targetHandle: 'latent_image' },
  { id: 'e6', source: 'sampler', target: 'vae', targetHandle: 'samples' },
  { id: 'e7', source: 'vae', target: 'out', targetHandle: 'images' },
]

export const RUN_COST = 120 // estimated credits for one i2v run
export const STARTING_CREDITS = 400

// ---- Bet 2: model suggestions for the wizard ---------------------------------

export const MODEL_SUGGESTIONS: Record<string, { name: string; tag: string }[]> = {
  video: [
    { name: 'Wan 2.2 I2V', tag: 'Recommended' },
    { name: 'LTX-2.3', tag: 'Fast' },
    { name: 'Hunyuan Video', tag: 'High quality' },
  ],
  image: [
    { name: 'Flux.1', tag: 'Recommended' },
    { name: 'Qwen-Image', tag: 'Sharp text' },
    { name: 'SDXL', tag: 'Classic' },
  ],
  audio: [{ name: 'ACE-Step V1', tag: 'Recommended' }],
  '3d': [{ name: 'Hunyuan3D 2.0', tag: 'Recommended' }],
}

// ---- Bet 3: showroom + explore ----------------------------------------------

export const SHOWROOM: ShowroomItem[] = [
  { id: 's3', title: 'Anime portrait set', author: 'inkwave', avatar: '🐙', thumb: 'editorial-fashion.jpg', kind: 'image', likes: 2100, comments: 120, remixes: 460, model: 'Flux', featured: true, commentList: [{ author: 'fld.motion', avatar: '🦋', text: 'the linework is unreal 🔥', time: '3h' }, { author: 'studio.ko', avatar: '🐼', text: 'what LoRA did you use?', time: '1h' }] },
  { id: 's1', title: 'Neon city flythrough', author: 'maya.r', avatar: '🦊', thumb: 'result-video.mp4', kind: 'video', likes: 1280, comments: 64, remixes: 210, model: 'Wan 2.2', featured: true, commentList: [{ author: 'inkwave', avatar: '🐙', text: 'the motion is so smooth', time: '2h' }, { author: 'pixel.chef', avatar: '🐝', text: 'remixing this tonight', time: '40m' }] },
  { id: 's2', title: 'Product hero — sneaker', author: 'studio.ko', avatar: '🐼', thumb: 'uc-product-photo.jpg', kind: 'product', likes: 940, comments: 31, remixes: 175, model: 'Flux' },
  // forks of the anime set (s3) — these drive the remix-tree panel
  { id: 's3a', title: 'Anime portrait — cyber', author: 'fld.motion', avatar: '🦋', thumb: 'result-image.jpg', kind: 'image', likes: 540, comments: 19, remixes: 41, model: 'Flux', forkedFrom: { id: 's3', author: 'inkwave' } },
  { id: 's3b', title: 'Anime portrait — pastel', author: 'sunsetdsp', avatar: '🦄', thumb: 'uc-enhance-restyle.jpg', kind: 'image', likes: 330, comments: 8, remixes: 22, model: 'Flux', forkedFrom: { id: 's3', author: 'inkwave' } },
  { id: 's5', title: 'Cinematic food still', author: 'pixel.chef', avatar: '🐝', thumb: 'showroom-1.jpg', kind: 'image', likes: 1530, comments: 88, remixes: 240, model: 'Flux', featured: true, commentList: [{ author: 'maya.r', avatar: '🦊', text: 'makes me hungry 😋', time: '5h' }] },
]

/** Direct remix children of an item (items whose forkedFrom.id === id). */
export function childrenOf(id: string, items: ShowroomItem[]): ShowroomItem[] {
  return items.filter((it) => it.forkedFrom?.id === id)
}

/** The parent item this was forked from, if any. */
export function parentOf(item: ShowroomItem, items: ShowroomItem[]): ShowroomItem | undefined {
  return item.forkedFrom ? items.find((it) => it.id === item.forkedFrom!.id) : undefined
}

// ---- Bet 3: creators (your profile + recruiter-browse cards) -----------------

export const YOU_HANDLE = 'you'

export const CREATORS: Creator[] = [
  { handle: 'you', name: 'Eric', avatar: 'E', bio: 'New here — making my first renders on Comfy Cloud.', skills: ['Image-to-Video'], styles: ['Cinematic'], openToWork: false, workTypes: [], followers: 0, thumb: 'result-video.mp4', isYou: true },
  { handle: 'inkwave', name: 'Ink Wave', avatar: '🐙', bio: 'Anime & character art. Flux specialist.', skills: ['Text-to-Image', 'Character'], styles: ['Anime', 'Illustration'], openToWork: true, workTypes: ['commissions', 'freelance'], followers: 18400, thumb: 'editorial-fashion.jpg' },
  { handle: 'maya.r', name: 'Maya R.', avatar: '🦊', bio: 'Motion designer. I make cities move.', skills: ['Image-to-Video', 'Motion'], styles: ['Cinematic', 'Neon'], openToWork: true, workTypes: ['freelance', 'full-time'], followers: 9200, thumb: 'result-video.mp4' },
  { handle: 'studio.ko', name: 'Studio Ko', avatar: '🐼', bio: 'Product & e-commerce imagery at scale.', skills: ['Product', 'Text-to-Image'], styles: ['Studio', 'Clean'], openToWork: true, workTypes: ['commissions'], followers: 6100, thumb: 'uc-product-photo.jpg' },
  { handle: 'pixel.chef', name: 'Pixel Chef', avatar: '🐝', bio: 'Food & beverage motion loops.', skills: ['Image-to-Video', 'Motion'], styles: ['Cinematic', 'Food'], openToWork: false, workTypes: [], followers: 12500, thumb: 'showroom-1.jpg' },
  { handle: 'fld.motion', name: 'Field Motion', avatar: '🦋', bio: 'Experimental loops & restyles.', skills: ['Image-to-Video', 'Restyle'], styles: ['Abstract', 'Neon'], openToWork: true, workTypes: ['commissions', 'freelance'], followers: 4300, thumb: 'result-image.jpg' },
]

/** Distinct skills/styles for the recruiter filter chips. */
export const SKILL_FILTERS = ['Image-to-Video', 'Text-to-Image', 'Product', 'Character', 'Motion', 'Restyle']
export const STYLE_FILTERS = ['Cinematic', 'Anime', 'Studio', 'Neon', 'Abstract']

// ---- Bet 3: canned hiring edges ---------------------------------------------

export const PUBLISH_REWARD = 15
export const REMIX_RECEIVED_REWARD = 10

export interface CommissionBrief {
  from: string
  avatar: string
  budget: string
  title: string
  body: string
}

export const COMMISSION_BRIEF: CommissionBrief = {
  from: 'studio.ko',
  avatar: '🐼',
  budget: '$400–600',
  title: 'Looping product video for a sneaker drop',
  body: 'Loved your neon flythrough. We need a 5s looping hero video for a sneaker launch — image-to-video from a product still, cinematic motion. Can you build the workflow and deliver the clip + the reusable Comfy workflow?',
}

export interface Opportunity {
  id: string
  title: string
  org: string
  pay: string
  tag: string
}

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: 'AI motion designer (contract)', org: 'Neon Studio', pay: '$60–90/hr', tag: 'Image-to-Video' },
  { id: 'o2', title: 'Product imagery — 50 SKUs', org: 'DTC brand', pay: '$1.2k fixed', tag: 'Product' },
  { id: 'o3', title: 'Character concept set', org: 'Indie game', pay: '$800 fixed', tag: 'Character' },
]

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n5', kind: 'commission', text: 'studio.ko sent you a commission request', time: '5m' },
  { id: 'n1', kind: 'like', text: 'maya.r and 23 others liked your render', time: '12m' },
  { id: 'n6', kind: 'remix', text: 'fld.motion remixed your workflow', time: '40m' },
  { id: 'n2', kind: 'comment', text: 'studio.ko commented: “what model is this?”', time: '1h' },
  { id: 'n3', kind: 'follow', text: 'inkwave started following you', time: '3h' },
  { id: 'n4', kind: 'post', text: 'fld.motion (you follow) posted a new workflow', time: '1d' },
]

export const LESSONS: Lesson[] = [
  { id: 'l1', concept: 'VAE', blurb: 'A VAE encodes images into a compact "latent" space the model works in, then decodes the result back into pixels.', reward: 20 },
  { id: 'l2', concept: 'LoRA', blurb: 'A LoRA is a small add-on that nudges a base model toward a style or subject — without retraining the whole thing.', reward: 20 },
  { id: 'l3', concept: 'Diffusion', blurb: 'Diffusion models start from random noise and remove it step by step, guided by your prompt, until an image or frame emerges.', reward: 20 },
]

// ---- Bet 1: intake wizard data ----------------------------------------------

export const ROLES: RoleOption[] = [
  { id: 'visual_artist', label: 'Visual artist / illustrator' },
  { id: 'film_vfx', label: 'Film / VFX — technical director' },
  { id: 'game_artist', label: 'Game artist' },
  { id: 'marketing', label: 'Marketing / ad creative' },
  { id: 'product_ecom', label: 'Product / e-commerce' },
  { id: 'developer', label: 'Developer / researcher' },
  { id: 'student', label: 'Student' },
  { id: 'hobbyist', label: 'Hobbyist / just exploring' },
  { id: 'other', label: 'Other' },
]

// Order matters: this is the default "popularity" order shown when a role
// doesn't re-sort the grid. The hero demo path is `animate_still`.
export const USE_CASES: UseCaseOption[] = [
  {
    id: 'animate_still',
    label: 'Animate a still',
    blurb: 'Bring a single image to life as a short clip.',
    thumb: 'grad-1',
    tags: ['Image to Video'],
    media: 'result-video.mp4',
    mediaType: 'video',
    modality: 'video',
  },
  {
    id: 'product_photo',
    label: 'Product photo',
    blurb: 'Studio-quality product shots from one image.',
    thumb: 'grad-2',
    tags: ['Image'],
    media: 'uc-product-photo.jpg',
    mediaType: 'image',
    modality: 'product',
  },
  {
    id: 'social_ad',
    label: 'Social ad',
    blurb: 'Scroll-stopping ad creative — still or motion.',
    thumb: 'grad-3',
    tags: ['Image', 'Video'],
    media: 'editorial-fashion.jpg',
    mediaType: 'image',
    modality: null,
    ambiguous: true,
  },
  {
    id: 'talking_avatar',
    label: 'Talking avatar',
    blurb: 'Turn a portrait into a speaking character.',
    thumb: 'grad-4',
    tags: ['Image to Video'],
    media: 'talking-avatar.gif',
    mediaType: 'image',
    modality: 'video',
  },
  {
    id: 'character_art',
    label: 'Character / concept art',
    blurb: 'Design characters and concept frames.',
    thumb: 'grad-5',
    tags: ['Text to Image'],
    media: 'result-image.jpg',
    mediaType: 'image',
    modality: 'image',
  },
  {
    id: 'cinematic',
    label: 'Cinematic shot / B-roll',
    blurb: 'Generate film-style motion from a prompt.',
    thumb: 'grad-6',
    tags: ['Text to Video'],
    media: 'result-video.mp4',
    mediaType: 'video',
    modality: 'video',
  },
  {
    id: 'enhance_restyle',
    label: 'Enhance / restyle image',
    blurb: 'Restyle or upscale an existing image.',
    thumb: 'grad-1',
    tags: ['Image to Image'],
    media: 'uc-enhance-restyle.jpg',
    mediaType: 'image',
    modality: 'image',
  },
]

// Greyed, non-interactive cards shown for breadth (never clickable).
export const COMING_SOON: { label: string; blurb: string }[] = [
  { label: 'Music', blurb: 'Generate audio tracks and sound.' },
  { label: '3D model', blurb: 'Create 3D assets from a prompt.' },
]

// Role -> use-cases surfaced first. Empty array = use default USE_CASES order.
export const ROLE_USECASE_ORDER: Record<Role, UseCaseOption['id'][]> = {
  visual_artist: ['character_art', 'animate_still', 'enhance_restyle', 'cinematic'],
  film_vfx: ['cinematic', 'animate_still', 'talking_avatar', 'character_art'],
  game_artist: ['character_art', 'enhance_restyle', 'animate_still', 'product_photo'],
  marketing: ['social_ad', 'product_photo', 'animate_still', 'talking_avatar'],
  product_ecom: ['product_photo', 'social_ad', 'animate_still'],
  developer: [],
  student: [],
  hobbyist: [],
  other: [],
}

// ---- Second real template: Product / image (Flux-style) ----------------------

export const IMG_FIELDS: WorkflowField[] = [
  {
    id: 'image',
    label: 'Product image',
    hint: 'The product to restage',
    kind: 'image',
    value: 'sample-product',
  },
  {
    id: 'prompt',
    label: 'Scene prompt',
    hint: 'Describe the backdrop and styling',
    kind: 'textarea',
    value: 'studio backdrop, soft gradient light, premium e-commerce look',
  },
  {
    id: 'style',
    label: 'Style preset',
    kind: 'select',
    value: 'studio',
    options: ['studio', 'lifestyle', 'gradient', 'outdoor'],
  },
  {
    id: 'aspect',
    label: 'Aspect ratio',
    kind: 'select',
    value: '1:1',
    options: ['1:1', '4:5', '16:9'],
  },
]

export const IMG_NODES: GraphNode[] = [
  {
    id: 'load-model', title: 'Load Diffusion Model', type: 'model',
    out: { label: 'MODEL', kind: 'model' }, advanced: true,
    params: [
      { name: 'unet_name', value: 'flux1-dev.safetensors', control: 'dropdown' },
      { name: 'weight_dtype', value: 'default', control: 'dropdown' },
    ],
    note: 'The image model. Diffusion = denoise random noise into an image step by step.',
  },
  {
    id: 'load-clip', title: 'Load CLIP', type: 'conditioning', advanced: true,
    out: { label: 'CLIP', kind: 'clip' },
    params: [
      { name: 'clip_name', value: 't5xxl_fp16.safetensors', control: 'dropdown' },
      { name: 'type', value: 'flux', control: 'dropdown' },
    ],
    note: 'The text encoder that turns words into guidance vectors.',
  },
  {
    id: 'load-vae', title: 'Load VAE', type: 'vae',
    out: { label: 'VAE', kind: 'vae' },
    params: [{ name: 'vae_name', value: 'ae.safetensors', control: 'dropdown' }],
    note: 'Encodes/decodes between pixels and the compact latent space.',
  },
  {
    id: 'load-img', title: 'Load Image', type: 'input', editable: true,
    out: { label: 'IMAGE', kind: 'image' },
    params: [{ name: 'image', value: 'product.png', control: 'dropdown' }],
    note: 'Your product shot — the one field most people change.',
  },
  {
    id: 'clip', title: 'CLIP Text Encode (Prompt)', type: 'conditioning', editable: true,
    ins: [{ name: 'clip', kind: 'clip' }], out: { label: 'CONDITIONING', kind: 'cond' },
    params: [{ name: 'text', value: 'studio backdrop, soft gradient light, premium e-commerce look', control: 'text' }],
    note: 'Turns your scene prompt into guidance the model understands.',
  },
  {
    id: 'czo', title: 'ConditioningZeroOut', type: 'conditioning',
    ins: [{ name: 'conditioning', kind: 'cond' }], out: { label: 'CONDITIONING', kind: 'cond' },
    note: 'A blank negative prompt — what you do NOT want.',
  },
  {
    id: 'sampler', title: 'KSampler', type: 'sampler',
    ins: [
      { name: 'model', kind: 'model' },
      { name: 'positive', kind: 'cond' },
      { name: 'negative', kind: 'cond' },
      { name: 'latent_image', kind: 'latent' },
    ],
    out: { label: 'LATENT', kind: 'latent' },
    params: [
      { name: 'seed', value: '90218477311', control: 'seed' },
      { name: 'steps', value: '20', control: 'stepper' },
      { name: 'cfg', value: '3.5', control: 'stepper' },
      { name: 'sampler_name', value: 'euler', control: 'dropdown' },
      { name: 'scheduler', value: 'normal', control: 'dropdown' },
      { name: 'denoise', value: '1.00', control: 'stepper' },
    ],
    note: 'Runs the denoising steps. More steps = cleaner, slower, pricier.',
  },
  {
    id: 'vae', title: 'VAE Decode', type: 'vae',
    ins: [{ name: 'samples', kind: 'latent' }, { name: 'vae', kind: 'vae' }],
    out: { label: 'IMAGE', kind: 'image' },
    note: 'Converts the latents back into actual pixels.',
  },
  {
    id: 'out', title: 'Save Image', type: 'output',
    ins: [{ name: 'images', kind: 'image' }],
    params: [{ name: 'filename_prefix', value: 'ComfyUI', control: 'dropdown' }],
    note: 'Your finished product shot.',
  },
]

export const IMG_EDGES: GraphEdge[] = [
  { id: 'ie1', source: 'load-model', target: 'sampler', targetHandle: 'model' },
  { id: 'ie2', source: 'load-clip', target: 'clip', targetHandle: 'clip' },
  { id: 'ie3', source: 'clip', target: 'sampler', targetHandle: 'positive' },
  { id: 'ie4', source: 'clip', target: 'czo', targetHandle: 'conditioning' },
  { id: 'ie5', source: 'czo', target: 'sampler', targetHandle: 'negative' },
  { id: 'ie6', source: 'load-img', target: 'sampler', targetHandle: 'latent_image' },
  { id: 'ie7', source: 'load-vae', target: 'vae', targetHandle: 'vae' },
  { id: 'ie8', source: 'sampler', target: 'vae', targetHandle: 'samples' },
  { id: 'ie9', source: 'vae', target: 'out', targetHandle: 'images' },
]

export const IMG_RUN_COST = 60 // image runs are cheaper than video (RUN_COST = 120)

export const I2V_GROUPS: GraphGroup[] = [
  {
    id: 'load', label: 'Load models', step: 'Step 1 — load the video model', nodeIds: ['load-model'],
    comment: { title: 'Step 1 — Load the model 🔋', body: ['Loads the **diffusion model** that turns noise into video frames.', '*wan2.2_i2v* is an image-to-video model.'] },
  },
  {
    id: 'input', label: 'Input image', step: 'Step 2 — your still frame', nodeIds: ['load-img'],
    comment: { title: 'Step 2 — Input image 🖼️', body: ['Your **starting frame** — the one field most people change.', 'Drop in a still and the model brings it to life.'] },
  },
  {
    id: 'prompt', label: 'Prompt', step: 'Step 3 — describe the motion', nodeIds: ['clip', 'czo'],
    comment: { title: 'Step 3 — Write a prompt ✍️', body: ['**CLIP Text Encode** turns your words into a guidance vector.', '**ConditioningZeroOut** is the blank negative — what to avoid.'] },
  },
  {
    id: 'sampling', label: 'Sampling', step: 'Step 4 — denoise into frames', nodeIds: ['sampler'],
    comment: { title: 'Step 4 — Sampling 🎛️', body: ['**KSampler** is the heart of inference.', '**steps** 3–12, **cfg** ~1–3, **seed** locks reproducibility.'] },
  },
  {
    id: 'decode', label: 'Decode & Save', step: 'Step 5 — render the clip', nodeIds: ['vae', 'out'],
    comment: { title: 'Step 5 — Decode & Save 💾', body: ['**VAE Decode** turns latents back into pixels.', '**Save Video** writes your finished clip.'] },
  },
]

export const IMG_GROUPS: GraphGroup[] = [
  {
    id: 'load', label: 'Load models', step: 'Step 1 — model, CLIP, VAE', nodeIds: ['load-model', 'load-clip', 'load-vae'],
    comment: { title: 'Step 1 — Load the models 🔋', body: ['Load three essentials:', '**Diffusion Model** denoises into images.', '**CLIP** encodes your prompt. **VAE** converts pixels ↔ latents.'] },
  },
  {
    id: 'input', label: 'Input image', step: 'Step 2 — your product shot', nodeIds: ['load-img'],
    comment: { title: 'Step 2 — Input image 🖼️', body: ['Your **product shot** — the one field most people change.'] },
  },
  {
    id: 'prompt', label: 'Prompt', step: 'Step 3 — describe the scene', nodeIds: ['clip', 'czo'],
    comment: { title: 'Step 3 — Write a prompt ✍️', body: ['**CLIP Text Encode** turns your scene description into guidance.', '**ConditioningZeroOut** is the blank negative.'] },
  },
  {
    id: 'sampling', label: 'Sampling', step: 'Step 4 — denoise the latents', nodeIds: ['sampler'],
    comment: { title: 'Step 4 — Sampling 🎛️', body: ['**KSampler** is the heart of inference.', '**steps** ~20, **cfg** ~3.5 for Flux. **seed** locks reproducibility.'] },
  },
  {
    id: 'decode', label: 'Decode & Save', step: 'Step 5 — save the image', nodeIds: ['vae', 'out'],
    comment: { title: 'Step 5 — Decode & Save 💾', body: ['**VAE Decode** turns latents back into pixels.', '**Save Image** writes your finished shot.'] },
  },
]

export const TEMPLATE_MEDIA: Record<Template, { input: string; result: string; resultType: 'video' | 'image' }> = {
  video: { input: 'input-still.jpg', result: 'result-video.mp4', resultType: 'video' },
  image: { input: 'uc-product-photo.jpg', result: 'result-image.jpg', resultType: 'image' },
}

// ---- Bet 2: Build with AI -----------------------------------------------------

export const WORKFLOWS: StartWorkflow[] = [
  { id: 'cinematic-i2v', title: 'Cinematic Image to Video — Wan 2.2', model: 'Wan 2.2', nodeCount: 6, rating: 1200, thumb: 'result-video.mp4', mediaType: 'video', template: 'video', desc: 'Bring a single still to life as a cinematic clip with a motion prompt.' },
  { id: 'talking-avatar', title: 'Talking avatar', model: 'Wan 2.2', nodeCount: 6, rating: 940, thumb: 'editorial-fashion.jpg', mediaType: 'image', template: 'video', desc: 'Turn a portrait into a speaking, expressive character.' },
  { id: 'broll', title: 'B-roll generator', model: 'LTX 2.3', nodeCount: 6, rating: 610, thumb: 'ltx-flf2v.mp4', mediaType: 'video', template: 'video', desc: 'Generate film-style B-roll motion from a first/last frame.' },
  { id: 'product-hero', title: 'Product hero — studio', model: 'Flux', nodeCount: 8, rating: 1530, thumb: 'result-image.jpg', mediaType: 'image', template: 'image', focus: 'top', desc: 'Studio-grade product hero shots from one input image.' },
  { id: 'restyle', title: 'Restyle / enhance', model: 'Flux', nodeCount: 8, rating: 480, thumb: 'uc-enhance-restyle.jpg', mediaType: 'image', template: 'image', desc: 'Restyle or upscale an existing image into a new look.' },
  { id: 'product-ad', title: 'Product ad still', model: 'Flux', nodeCount: 8, rating: 720, thumb: 'uc-product-photo.jpg', mediaType: 'image', template: 'image', desc: 'Scroll-stopping product ad creative, ready for social.' },
]

// Role -> recommended workflow ids (all 9 roles; mirrors Bet 1's intent).
export const ROLE_WORKFLOW_RECS: Record<Role, string[]> = {
  visual_artist: ['cinematic-i2v', 'restyle', 'product-hero'],
  film_vfx: ['cinematic-i2v', 'talking-avatar', 'broll'],
  game_artist: ['restyle', 'cinematic-i2v', 'product-hero'],
  marketing: ['product-ad', 'product-hero', 'cinematic-i2v'],
  product_ecom: ['product-hero', 'product-ad', 'restyle'],
  developer: ['cinematic-i2v', 'product-hero', 'restyle'],
  student: ['cinematic-i2v', 'product-hero', 'restyle'],
  hobbyist: ['cinematic-i2v', 'product-hero', 'restyle'],
  other: ['cinematic-i2v', 'product-hero', 'restyle'],
}

const DEFAULT_REC_IDS = ['cinematic-i2v', 'product-hero', 'restyle']

// Plain keyword search over the template library (matches title + model).
export function searchTemplates(query: string): StartWorkflow[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return WORKFLOWS.filter(
    (w) => w.title.toLowerCase().includes(q) || w.model.toLowerCase().includes(q),
  )
}

// Personalized recommendations: role-based picks (mirrors Bet 1's intent),
// with the user's chosen output modality floated to the front.
export function recommendByIntake(
  role: Role | null,
  output: OutputType | null,
): StartWorkflow[] {
  const ids = role ? ROLE_WORKFLOW_RECS[role] : DEFAULT_REC_IDS
  const picks = ids
    .map((id) => WORKFLOWS.find((w) => w.id === id))
    .filter((w): w is StartWorkflow => Boolean(w))
  const target: Template | null =
    output === 'video' ? 'video' : output === 'image' || output === 'product' ? 'image' : null
  if (!target) return picks
  // stable sort: templates matching the goal modality first
  return picks
    .map((w, i) => ({ w, i }))
    .sort((a, b) => (a.w.template === target ? 0 : 1) - (b.w.template === target ? 0 : 1) || a.i - b.i)
    .map(({ w }) => w)
}

// Canned agent conversation per active template. targetNodeIds exist in the
// matching graph (video=I2V_NODES, image=IMG_NODES).
export const BUILD_SCRIPT: Record<Template, AgentStep[]> = {
  video: [
    {
      kind: 'guide',
      text: 'Step 1 of 3 — let’s set the motion. I’ve drafted a prompt for you below — edit it or just hit send and I’ll write it into the Prompt node.',
      targetNodeId: 'clip',
      tool: 'set_node_param · CLIP Text Encode',
      suggested: 'a girl walking through a sunlit flower field, hair drifting in the breeze, slow cinematic dolly-in',
    },
    { kind: 'choice', text: 'Step 2 of 3 — how long should the clip be?', targetNodeId: 'sampler', chips: ['3s', '5s', '8s'], tool: 'set_node_param · KSampler' },
    { kind: 'suggest', text: 'Step 3 of 3 — want it faster? I can swap Wan 2.2 → LTX-2.3 (≈3× quicker, slightly less detail).', targetNodeId: 'load-model', applyLabel: 'Swap to LTX', tool: 'swap_model · LTX 2.3', override: { title: 'Load Diffusion Model (LTX-2.3)', note: 'Faster video model — fewer steps, quicker renders.' } },
  ],
  image: [
    {
      kind: 'guide',
      text: 'Step 1 of 3 — let’s describe the scene. I’ve drafted a prompt for you below — tweak it or just hit send and I’ll write it into the Prompt node.',
      targetNodeId: 'clip',
      tool: 'set_node_param · CLIP Text Encode',
      suggested: 'matte black perfume bottle on a marble pedestal, soft studio gradient light, premium e-commerce look',
    },
    { kind: 'choice', text: 'Step 2 of 3 — pick an aspect ratio.', targetNodeId: 'load-img', chips: ['1:1', '4:5', '16:9'], tool: 'set_aspect_ratio · Load Image' },
    { kind: 'suggest', text: 'Step 3 of 3 — want sharper detail? I can add a refiner pass on the model.', targetNodeId: 'load-model', applyLabel: 'Add refiner', tool: 'add_node · Refiner', override: { title: 'Load Diffusion Model (Flux + refiner)', note: 'Adds a refinement pass for crisper output.' } },
  ],
}
