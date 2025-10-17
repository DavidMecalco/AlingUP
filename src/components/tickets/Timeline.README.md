# Timeline Component Documentation

## Overview

The Timeline component provides a comprehensive chronological view of all events related to a ticket. It displays events with icons, user information, timestamps, and detailed descriptions.

## Components

### Timeline Component
- **Location**: `src/components/tickets/Timeline.jsx`
- **Purpose**: Display chronological ticket events with rich formatting
- **Features**:
  - Event icons and color coding
  - User information display
  - Relative timestamps
  - Event details and additional data
  - Loading and error states
  - Responsive design

### Timeline Service
- **Location**: `src/services/timelineService.js`
- **Purpose**: Manage timeline events in the database
- **Features**:
  - CRUD operations for timeline events
  - Specialized methods for different event types
  - Error handling and validation

### Timeline Hook
- **Location**: `src/hooks/useTimeline.js`
- **Purpose**: React hook for timeline state management
- **Features**:
  - Event loading and caching
  - Real-time event creation
  - Error handling
  - Refresh functionality

## Usage

### Basic Timeline Display

```jsx
import Timeline from './components/tickets/Timeline'

function TicketDetail({ ticketId }) {
  return (
    <div>
      <h3>Timeline de Actividad</h3>
      <Timeline ticketId={ticketId} />
    </div>
  )
}
```

### Using the Timeline Hook

```jsx
import { useTimeline } from './hooks/useTimeline'

function MyComponent({ ticketId }) {
  const {
    events,
    loading,
    error,
    createCommentAddedEvent,
    createStateChangedEvent,
    refresh
  } = useTimeline(ticketId)

  const handleAddComment = async () => {
    await createCommentAddedEvent(userId, userName)
  }

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      <p>Total eventos: {events.length}</p>
      <button onClick={handleAddComment}>Agregar Comentario</button>
    </div>
  )
}
```

### Creating Timeline Events

```jsx
import timelineService from './services/timelineService'

// Create a ticket creation event
await timelineService.createTicketCreatedEvent(ticketId, userId, ticketNumber)

// Create a state change event
await timelineService.createStateChangedEvent(ticketId, 'abierto', 'en_progreso', userId)

// Create a comment event
await timelineService.createCommentAddedEvent(ticketId, userId, userName)

// Create a file upload event
await timelineService.createFileUploadedEvent(ticketId, userId, fileName, fileType)
```

### Using Timeline Helpers

```jsx
import { 
  createCommentTimelineEvent,
  createStateChangeTimelineEvent 
} from './utils/timelineHelpers'

// These helpers automatically handle errors and don't break the main flow
await createCommentTimelineEvent(ticketId, userId, userName)
await createStateChangeTimelineEvent(ticketId, oldState, newState, userId)
```

## Event Types

The timeline supports the following event types:

| Event Type | Icon | Color | Description |
|------------|------|-------|-------------|
| `ticket_creado` | 🎫 | Blue | Ticket creation |
| `ticket_asignado` | 👤 | Purple | Ticket assignment |
| `estado_cambiado` | 🔄 | Yellow | State changes |
| `comentario_agregado` | 💬 | Green | Comment addition |
| `archivo_subido` | 📎 | Indigo | File uploads |
| `ticket_cerrado` | ✅ | Red | Ticket closure |
| `ticket_reabierto` | 🔓 | Orange | Ticket reopening |

## Database Schema

The timeline uses the `ticket_timeline` table with the following structure:

```sql
CREATE TABLE public.ticket_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  evento_tipo timeline_evento_tipo NOT NULL,
  descripcion TEXT NOT NULL,
  datos_adicionales JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Integration Examples

### With Comment System

```jsx
// In CommentForm component
const handleSubmit = async (commentData) => {
  // Create the comment
  const result = await commentService.createComment(ticketId, content, userId)
  
  if (result.data) {
    // Create timeline event
    await createCommentTimelineEvent(ticketId, userId, userName)
  }
}
```

### With State Management

```jsx
// In ticket state change handler
const handleStateChange = async (newState) => {
  const oldState = ticket.estado
  
  // Update ticket state
  const result = await ticketService.changeTicketState(ticketId, newState)
  
  if (result.data) {
    // Create timeline event
    await createStateChangeTimelineEvent(ticketId, oldState, newState, userId)
  }
}
```

## Styling

The Timeline component uses Tailwind CSS classes and supports dark mode. Key styling features:

- Responsive design (mobile-first)
- Dark mode support
- Color-coded event types
- Smooth animations
- Loading skeletons
- Error states

## Performance Considerations

- Events are loaded once and cached
- Real-time updates through the hook
- Pagination support for large timelines
- Optimistic UI updates
- Error boundaries for resilience

## Testing

Use the `TimelineDemo` component to test all timeline functionality:

```jsx
import TimelineDemo from './components/tickets/TimelineDemo'

function TestPage() {
  return <TimelineDemo ticketId="your-ticket-id" />
}
```

## Error Handling

The timeline components include comprehensive error handling:

- Network errors with retry functionality
- Invalid data graceful degradation
- Loading states for better UX
- Error boundaries to prevent crashes
- Fallback UI for missing data