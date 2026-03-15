'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TemplateGallery, { type Template } from '@/components/TemplateGallery'

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'Meeting Notes',
    description: 'Structured meeting notes with agenda, attendees, action items, and follow-ups.',
    type: 'document',
    category: 'project',
    content: { blocks: [{ type: 'heading', text: 'Meeting Notes' }, { type: 'section', text: 'Agenda' }, { type: 'section', text: 'Action Items' }] },
    is_public: true,
    created_by: null,
    usage_count: 342,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Project Brief',
    description: 'Define project goals, scope, timeline, and key stakeholders.',
    type: 'document',
    category: 'project',
    content: { blocks: [{ type: 'heading', text: 'Project Brief' }, { type: 'section', text: 'Goals' }, { type: 'section', text: 'Timeline' }] },
    is_public: true,
    created_by: null,
    usage_count: 218,
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'Wireframe Kit',
    description: 'Low-fidelity wireframe components for rapid prototyping on the whiteboard.',
    type: 'whiteboard',
    category: 'design',
    content: { elements: [{ type: 'rectangle', label: 'Header' }, { type: 'rectangle', label: 'Content' }] },
    is_public: true,
    created_by: null,
    usage_count: 156,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Sprint Retrospective',
    description: 'What went well, what to improve, and action items for the next sprint.',
    type: 'document',
    category: 'engineering',
    content: { blocks: [{ type: 'heading', text: 'Sprint Retro' }, { type: 'section', text: 'Went Well' }, { type: 'section', text: 'Improve' }] },
    is_public: true,
    created_by: null,
    usage_count: 189,
    created_at: '2026-02-05T00:00:00Z',
  },
  {
    id: '5',
    name: 'User Journey Map',
    description: 'Map out user touchpoints, emotions, and pain points across the experience.',
    type: 'whiteboard',
    category: 'design',
    content: { elements: [{ type: 'swimlane', label: 'Awareness' }, { type: 'swimlane', label: 'Consideration' }] },
    is_public: true,
    created_by: null,
    usage_count: 127,
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: '6',
    name: 'Content Calendar',
    description: 'Plan and schedule content across channels with deadlines and owners.',
    type: 'document',
    category: 'marketing',
    content: { blocks: [{ type: 'heading', text: 'Content Calendar' }, { type: 'table', columns: ['Date', 'Channel', 'Topic', 'Owner'] }] },
    is_public: true,
    created_by: null,
    usage_count: 95,
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: '7',
    name: 'Team Workspace',
    description: 'Pre-configured workspace with channels for docs, designs, and discussions.',
    type: 'workspace',
    category: 'project',
    content: { channels: ['Documents', 'Designs', 'Discussions'] },
    is_public: true,
    created_by: null,
    usage_count: 73,
    created_at: '2026-02-20T00:00:00Z',
  },
  {
    id: '8',
    name: 'Onboarding Checklist',
    description: 'New hire onboarding checklist with tasks, resources, and milestones.',
    type: 'document',
    category: 'hr',
    content: { blocks: [{ type: 'heading', text: 'Onboarding' }, { type: 'checklist', items: ['Setup accounts', 'Meet team', 'First project'] }] },
    is_public: true,
    created_by: null,
    usage_count: 64,
    created_at: '2026-02-25T00:00:00Z',
  },
  {
    id: '9',
    name: 'Lesson Plan',
    description: 'Structure lessons with objectives, activities, materials, and assessments.',
    type: 'document',
    category: 'education',
    content: { blocks: [{ type: 'heading', text: 'Lesson Plan' }, { type: 'section', text: 'Objectives' }, { type: 'section', text: 'Activities' }] },
    is_public: true,
    created_by: null,
    usage_count: 41,
    created_at: '2026-03-01T00:00:00Z',
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates] = useState<Template[]>(sampleTemplates)

  const handleUseTemplate = (template: Template) => {
    if (template.type === 'document') {
      router.push(`/documents/new?template=${template.id}`)
    } else if (template.type === 'whiteboard') {
      router.push(`/whiteboard/new?template=${template.id}`)
    } else {
      router.push(`/workspaces?template=${template.id}`)
    }
  }

  return <TemplateGallery templates={templates} onUseTemplate={handleUseTemplate} />
}
