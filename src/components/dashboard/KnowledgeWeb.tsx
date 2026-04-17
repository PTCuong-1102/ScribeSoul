"use client"

import React, { useEffect, useState, useRef } from "react"
import { getKnowledgeGraph } from "@/server/actions/search"
import { Sparkles, Loader2 } from "lucide-react"

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

export function KnowledgeWeb({ workspaceId }: { workspaceId: string }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKnowledgeGraph(workspaceId)
        // Initialize random positions
        const initialNodes = data.nodes.map((n: { id: string; label: string; type: string }) => ({
          ...n,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          vx: 0,
          vy: 0
        }))
        setNodes(initialNodes)
        setLinks(data.links)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [workspaceId])

  // Simple Force-Directed Simulation
  useEffect(() => {
    if (nodes.length === 0 || loading) return

    let animationFrameId: number

    const update = () => {
      setNodes(prevNodes => {
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

          return {
            ...node,
            x: node.x + vx,
            y: node.y + vy,
            vx,
            vy
          }
        })
        return newNodes
      })
      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrameId)
  }, [loading, nodes.length])

  if (loading) return (
    <div className="w-full h-[400px] flex items-center justify-center bg-surface-container-lowest/30 rounded-3xl border border-border/5">
      <Loader2 className="w-6 h-6 text-secondary animate-spin" />
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
          <g key={node.id} transform={`translate(${node.x},${node.y})`}>
            {/* Glow */}
            <circle r="12" className="fill-secondary/20 blur-md animate-pulse" />
            <circle 
              r="6" 
              className={cn(
                "fill-surface-container-highest stroke-2 transition-all duration-300",
                node.type === "character" ? "stroke-primary" : "stroke-secondary"
              )} 
            />
            <text 
              dy="20" 
              textAnchor="middle" 
              className="text-[10px] font-sans fill-on-surface-variant/60 select-none pointer-events-none uppercase tracking-tighter"
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

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
