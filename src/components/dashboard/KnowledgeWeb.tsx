"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getKnowledgeGraph } from "@/server/actions/search"
import { Sparkles, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Node {
  id: string
  label: string
  type: string
  x: number
  y: number
  vx: number
  vy: number
}

interface Link {
  source: string
  target: string
}

// Threshold for total kinetic energy below which the simulation is considered stable
const KINETIC_ENERGY_THRESHOLD = 0.1
// Maximum number of simulation ticks to prevent infinite loops
const MAX_SIMULATION_TICKS = 300

export function KnowledgeWeb({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tickCountRef = useRef(0)
  const isSimulatingRef = useRef(false)

  const handleNodeClick = useCallback((nodeId: string) => {
    router.push(`/workspace/${workspaceId}/documents/${nodeId}`)
  }, [router, workspaceId])

  useEffect(() => {
    async function loadData() {
      setError(null)
      try {
        const data = await getKnowledgeGraph(workspaceId)
        if (data.nodes.length === 0) {
          setError("empty")
        } else {
          const initialNodes = data.nodes.map((n: { id: string; label: string; type: string }) => ({
            ...n,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            vx: 0,
            vy: 0
          }))
          setNodes(initialNodes)
          setLinks(data.links)
          tickCountRef.current = 0
          isSimulatingRef.current = true
        }
      } catch (e) {
        console.error("[KNOWLEDGE_WEB_ERROR]", e)
        setError("Không thể tải mạng lưới kiến thức. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [workspaceId])

  // Simple Force-Directed Simulation with convergence detection
  const simulationStep = useCallback(() => {
    setNodes(prevNodes => {
      let totalKineticEnergy = 0

      const newNodes = prevNodes.map(node => {
        let fx = 0, fy = 0

        // Repulsion from other nodes
        prevNodes.forEach(other => {
          if (node.id === other.id) return
          const dx = node.x - other.x
          const dy = node.y - other.y
          const distSq = dx * dx + dy * dy + 0.1
          const force = 1000 / distSq
          fx += (dx / Math.sqrt(distSq)) * force
          fy += (dy / Math.sqrt(distSq)) * force
        })

        // Attraction to center
        const centerX = 250, centerY = 200
        fx += (centerX - node.x) * 0.01
        fy += (centerY - node.y) * 0.01

        // Drag/Friction
        const vx = (node.vx + fx) * 0.8
        const vy = (node.vy + fy) * 0.8

        totalKineticEnergy += vx * vx + vy * vy

        return {
          ...node,
          x: node.x + vx,
          y: node.y + vy,
          vx,
          vy
        }
      })

      // Check if simulation has converged or exceeded max ticks
      tickCountRef.current += 1
      if (totalKineticEnergy < KINETIC_ENERGY_THRESHOLD || tickCountRef.current >= MAX_SIMULATION_TICKS) {
        isSimulatingRef.current = false
      }

      return newNodes
    })
  }, [])

  useEffect(() => {
    if (nodes.length === 0 || loading) return

    let animationFrameId: number

    const update = () => {
      if (!isSimulatingRef.current) return // Stop when converged
      simulationStep()
      animationFrameId = requestAnimationFrame(update)
    }

    isSimulatingRef.current = true
    tickCountRef.current = 0
    animationFrameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrameId)
  }, [loading, nodes.length, simulationStep])

  if (loading) return (
    <div className="w-full h-[400px] flex items-center justify-center bg-surface-container-lowest/30 rounded-3xl border border-border/5">
      <Loader2 className="w-6 h-6 text-secondary animate-spin" />
    </div>
  )

  if (error === "empty") return (
    <div className="relative w-full h-[400px] bg-surface-container-lowest/30 rounded-3xl border border-border/5 overflow-hidden flex items-center justify-center">
      <div className="text-center space-y-2 opacity-60">
        <Sparkles className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
        <p className="font-sans text-xs text-on-surface-variant/60">Chưa có tài liệu nào để hiển thị</p>
        <p className="font-sans text-[10px] text-on-surface-variant/40 italic">Hãy tạo các tài liệu và liên kết chúng để xây dựng mạng lưới kiến thức</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center bg-surface-container-lowest/30 rounded-3xl border border-border/5 space-y-3">
      <AlertTriangle className="w-8 h-8 text-destructive/60" />
      <p className="font-sans text-sm text-on-surface-variant/80 text-center max-w-md">{error}</p>
      <button
        onClick={() => {
          setLoading(true)
          setError(null)
          setNodes([])
          setLinks([])
        }}
        className="font-sans text-xs text-secondary hover:underline mt-2"
      >
        Thử lại
      </button>
    </div>
  )

  return (
    <div className="relative w-full h-[400px] bg-surface-container-lowest/30 rounded-3xl border border-border/5 overflow-hidden glass group">
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-secondary" />
        <h3 className="text-xs font-sans uppercase tracking-widest text-on-surface-variant font-medium">Soul Knowledge Web</h3>
      </div>
      
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" viewBox="0 0 500 400">
        {/* Draw Links */}
        {links.map((link, i) => {
          const source = nodes.find(n => n.id === link.source)
          const target = nodes.find(n => n.id === link.target)
          if (!source || !target) return null
          return (
            <line 
              key={i}
              x1={source.x} y1={source.y}
              x2={target.x} y2={target.y}
              stroke="currentColor"
              className="text-on-surface-variant/10"
              strokeWidth="1"
            />
          )
        })}

        {/* Draw Nodes */}
        {nodes.map(node => (
          <g
            key={node.id}
            transform={`translate(${node.x},${node.y})`}
            onClick={() => handleNodeClick(node.id)}
            className="cursor-pointer"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNodeClick(node.id) }}
          >
            <title>{node.label}</title>
            {/* Glow */}
            <circle r="12" className="fill-secondary/20 blur-md animate-pulse" />
            <circle
              r="6"
              className={cn(
                "fill-surface-container-highest stroke-2 transition-all duration-300 hover:stroke-[3]",
                node.type === "character" ? "stroke-primary" : "stroke-secondary"
              )}
            />
            <text
              dy="20"
              textAnchor="middle"
              className="text-[10px] font-sans fill-on-surface-variant/60 select-none uppercase tracking-tighter"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <p className="text-[10px] text-on-surface-variant/40 font-serif italic">AI connects the dots between your ideas...</p>
      </div>
    </div>
  )
}
