import { useMemo, type CSSProperties } from 'react'
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ChevronDown, Dice5, Check } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../../store/useStore'
import {
  I2V_NODES,
  I2V_EDGES,
  I2V_GROUPS,
  IMG_NODES,
  IMG_EDGES,
  IMG_GROUPS,
} from '../../data/seed'
import type {
  GraphNode,
  GraphEdge,
  GraphGroup,
  NodePort,
  NodeParam,
  PortKind,
} from '../../types'

// ---- ComfyUI-style palette ---------------------------------------------------
const PORT_COLORS: Record<PortKind, string> = {
  model: '#b48aff', // violet
  clip: '#e6d24a', // yellow
  cond: '#ff9d3c', // orange (conditioning)
  vae: '#ff5f6d', // red
  latent: '#ff7bd5', // pink
  image: '#5b9dff', // blue
}
const GROUP_BORDER = '#36707e'
const GROUP_BODY = 'rgba(38, 84, 95, 0.22)'
const GROUP_HEAD_BG = 'rgba(46, 92, 104, 0.55)'
const GROUP_HEAD_INK = '#bfe6ef'
const NODE_HEAD_BG = '#15151a'

// ---- Geometry (shared between layout math + handle positions) -----------------
const NODE_W = 216
const HEADER_H = 26
const PORT_H = 18
const PAD_T = 8
const PAD_B = 8
const TEXT_H = 58
const PARAM_H = 24
const ADV_H = 16

const COL_W = 250
const COL_PITCH = COL_W + 30
const GROUP_HEAD = 26
const GROUP_PAD_TOP = 10
const GROUP_PAD_BOTTOM = 14
const NODE_GAP = 14
const NODE_X_OFF = (COL_W - NODE_W) / 2
const COMMENT_GAP = 14

const inputTop = (i: number) => HEADER_H + PAD_T + i * PORT_H + PORT_H / 2

function paramsHeight(params?: NodeParam[]) {
  return (params ?? []).reduce(
    (h, p) => h + (p.control === 'text' ? TEXT_H : PARAM_H),
    0,
  )
}

function nodeHeight(n: GraphNode) {
  return (
    HEADER_H +
    PAD_T +
    (n.ins?.length ?? 0) * PORT_H +
    paramsHeight(n.params) +
    (n.advanced ? ADV_H : 0) +
    PAD_B
  )
}

// ---- Inline rich text (**bold**, *italic*) for comment cards ------------------
function rich(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return (
        <b key={i} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </b>
      )
    if (p.startsWith('*') && p.endsWith('*'))
      return (
        <i key={i} className="text-ink-dim">
          {p.slice(1, -1)}
        </i>
      )
    return <span key={i}>{p}</span>
  })
}

const dot = (color: string, top?: number): CSSProperties => ({
  width: 9,
  height: 9,
  background: color,
  border: '1.5px solid #0b0b0e',
  ...(top !== undefined ? { top } : {}),
})

// ---- Node types --------------------------------------------------------------
type NodeOverrides = Record<string, { title?: string; note?: string; textValue?: string }>
type ComfyData = {
  title: string
  editable?: boolean
  highlight?: boolean
  changed?: boolean
  flash?: boolean
  ins?: NodePort[]
  out?: { label: string; kind: PortKind }
  params?: NodeParam[]
  advanced?: boolean
}
type GroupData = { label: string; width: number; height: number }
type CommentData = { title: string; body: string[]; width: number }

function ParamRow({ p }: { p: NodeParam }) {
  if (p.control === 'text') {
    return (
      <div
        className="my-1 overflow-hidden rounded border border-border bg-[#0e0e12] px-2 py-1.5 font-mono text-[9.5px] leading-snug text-ink-dim"
        style={{ maxHeight: TEXT_H - 6 }}
      >
        {p.value}
      </div>
    )
  }
  return (
    <div
      className="flex items-center justify-between gap-2"
      style={{ height: PARAM_H }}
    >
      <span className="truncate text-[10px] text-ink-dim">{p.name}</span>
      {p.control === 'dropdown' ? (
        <div className="flex max-w-[124px] items-center gap-1 rounded border border-border bg-panel px-1.5 py-0.5 text-[10px] text-ink">
          <span className="truncate">{p.value}</span>
          <ChevronDown size={10} className="shrink-0 text-ink-faint" />
        </div>
      ) : (
        <div className="flex items-center rounded border border-border bg-panel text-[10px] text-ink">
          <span className="px-1 text-ink-faint">−</span>
          <span className="max-w-[78px] truncate px-1 tabular-nums">{p.value}</span>
          {p.control === 'seed' ? (
            <span className="flex items-center px-1 text-primary">
              <Dice5 size={11} />
            </span>
          ) : (
            <span className="px-1 text-ink-faint">+</span>
          )}
        </div>
      )}
    </div>
  )
}

function ComfyNode({ data }: NodeProps) {
  const d = data as ComfyData
  return (
    <div
      className={clsx(
        'relative rounded-md border bg-panel-2 shadow-lg',
        d.flash && 'animate-[editflash_1.4s_ease-out]',
        d.changed
          ? 'border-good ring-2 ring-good/50'
          : d.highlight
            ? 'border-primary ring-2 ring-primary/40'
            : d.editable
              ? 'border-primary'
              : 'border-[#3a3a44]',
      )}
      style={{ width: NODE_W }}
    >
      {d.highlight && !d.changed && (
        <div className="absolute -top-5 left-0 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
          ① EDIT HERE
        </div>
      )}
      {d.changed && (
        <div className="absolute -top-5 right-0 flex items-center gap-0.5 rounded bg-good px-1.5 py-0.5 text-[9px] font-bold text-bg">
          <Check size={9} strokeWidth={3} /> EDITED
        </div>
      )}

      {/* header */}
      <div
        className="flex items-center gap-1 rounded-t-md px-2"
        style={{ height: HEADER_H, background: NODE_HEAD_BG }}
      >
        <ChevronDown size={11} className="shrink-0 text-ink-faint" />
        <span className="truncate text-[11px] font-semibold text-ink">
          {d.title}
        </span>
        {d.out && (
          <span className="ml-auto truncate text-[9px] font-medium uppercase tracking-wide text-ink-faint">
            {d.out.label}
          </span>
        )}
      </div>
      {d.out && (
        <Handle
          type="source"
          id="out"
          position={Position.Right}
          isConnectable={false}
          style={dot(PORT_COLORS[d.out.kind], HEADER_H / 2)}
        />
      )}

      {/* body */}
      <div className="px-2 pb-2 pt-2">
        {d.ins?.map((p, i) => (
          <div key={p.name} className="flex items-center" style={{ height: PORT_H }}>
            <Handle
              type="target"
              id={p.name}
              position={Position.Left}
              isConnectable={false}
              style={dot(PORT_COLORS[p.kind], inputTop(i))}
            />
            <span className="text-[10px] text-ink-dim">{p.name}</span>
          </div>
        ))}
        {d.params?.map((p) => (
          <ParamRow key={p.name} p={p} />
        ))}
        {d.advanced && (
          <div className="mt-0.5 text-[9px] text-ink-faint">⚙ Show advanced inputs</div>
        )}
      </div>
    </div>
  )
}

function GroupBox({ data }: NodeProps) {
  const d = data as GroupData
  return (
    <div
      className="rounded-lg border"
      style={{
        width: d.width,
        height: d.height,
        borderColor: GROUP_BORDER,
        background: GROUP_BODY,
      }}
    >
      <div
        className="rounded-t-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: GROUP_HEAD_BG, color: GROUP_HEAD_INK }}
      >
        {d.label}
      </div>
    </div>
  )
}

function CommentCard({ data }: NodeProps) {
  const d = data as CommentData
  return (
    <div
      className="rounded-lg border border-border bg-panel px-3 py-2.5 shadow"
      style={{ width: d.width }}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink">
        <ChevronDown size={11} className="text-ink-faint" />
        {d.title}
      </div>
      <div className="space-y-1 text-[10px] leading-snug text-ink-dim">
        {d.body.map((l, i) => (
          <p key={i}>{rich(l)}</p>
        ))}
      </div>
    </div>
  )
}

const nodeTypes = {
  comfyNode: ComfyNode,
  groupBox: GroupBox,
  commentCard: CommentCard,
}

function build(
  nodes: GraphNode[],
  edges: GraphEdge[],
  groups: GraphGroup[],
  highlightNodeId?: string,
  overrides?: NodeOverrides,
  changedNodeIds: string[] = [],
  flashNodeId?: string,
) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const rfNodes: Node[] = []

  // Per-group heights, then a shared comment baseline so the comment cards line
  // up in one neat row beneath the tallest column (matches the real Comfy look).
  const groupHeights = groups.map((g) => {
    const hs = g.nodeIds.map((id) => (byId[id] ? nodeHeight(byId[id]) : 0))
    const bodyH = hs.reduce((a, b) => a + b, 0) + (g.nodeIds.length - 1) * NODE_GAP
    return GROUP_HEAD + GROUP_PAD_TOP + bodyH + GROUP_PAD_BOTTOM
  })
  const commentY = Math.max(...groupHeights) + COMMENT_GAP

  groups.forEach((g, gi) => {
    const gx = gi * COL_PITCH
    const heights = g.nodeIds.map((id) => (byId[id] ? nodeHeight(byId[id]) : 0))
    const groupH = groupHeights[gi]

    rfNodes.push({
      id: `grp-${g.id}`,
      type: 'groupBox',
      position: { x: gx, y: 0 },
      data: { label: g.label, width: COL_W, height: groupH },
      draggable: false,
      selectable: false,
      zIndex: 0,
    })

    let y = GROUP_HEAD + GROUP_PAD_TOP
    g.nodeIds.forEach((nid, ri) => {
      const n = byId[nid]
      if (!n) return
      const ov = overrides?.[nid]
      // a text-param override (e.g. the agent writing the prompt) swaps the value
      const params =
        ov?.textValue && n.params
          ? n.params.map((p) => (p.control === 'text' ? { ...p, value: ov.textValue! } : p))
          : n.params
      rfNodes.push({
        id: nid,
        type: 'comfyNode',
        position: { x: gx + NODE_X_OFF, y },
        data: {
          title: ov?.title ?? n.title,
          editable: n.editable,
          highlight: nid === highlightNodeId,
          changed: changedNodeIds.includes(nid),
          flash: nid === flashNodeId,
          ins: n.ins,
          out: n.out,
          params,
          advanced: n.advanced,
        },
        draggable: false,
        selectable: false,
        zIndex: 2,
      })
      y += heights[ri] + NODE_GAP
    })

    if (g.comment) {
      rfNodes.push({
        id: `cmt-${g.id}`,
        type: 'commentCard',
        position: { x: gx, y: commentY },
        data: { title: g.comment.title, body: g.comment.body, width: COL_W },
        draggable: false,
        selectable: false,
        zIndex: 1,
      })
    }
  })

  const rfEdges: Edge[] = edges.map((e) => {
    const color = PORT_COLORS[byId[e.source]?.out?.kind ?? 'image']
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: 'out',
      targetHandle: e.targetHandle,
      style: { stroke: color, strokeWidth: 2 },
    }
  })

  return { rfNodes, rfEdges }
}

export function NodeCanvas({
  highlightNodeId,
  nodeOverrides,
  changedNodeIds,
  flashNodeId,
  graph,
}: {
  highlightNodeId?: string
  nodeOverrides?: NodeOverrides
  changedNodeIds?: string[]
  flashNodeId?: string
  graph?: 'video' | 'image'
} = {}) {
  const template = useStore((s) => s.template())
  const t = graph ?? template
  const { rfNodes, rfEdges } = useMemo(
    () =>
      t === 'video'
        ? build(I2V_NODES, I2V_EDGES, I2V_GROUPS, highlightNodeId, nodeOverrides, changedNodeIds, flashNodeId)
        : build(IMG_NODES, IMG_EDGES, IMG_GROUPS, highlightNodeId, nodeOverrides, changedNodeIds, flashNodeId),
    [t, highlightNodeId, nodeOverrides, changedNodeIds, flashNodeId],
  )

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-[#0e1116]">
      <style>{`@keyframes editflash{0%{box-shadow:0 0 0 0 rgba(74,222,128,.55)}70%{box-shadow:0 0 0 10px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}`}</style>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#283142" gap={18} />
      </ReactFlow>
    </div>
  )
}
