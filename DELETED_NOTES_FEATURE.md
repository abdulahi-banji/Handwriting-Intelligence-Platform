# Deleted Notes Feature Implementation

## Overview
Added a comprehensive trash/recovery system for the Handwriting Intelligence Platform. Users can now move notes to trash instead of permanently deleting them, and recover them later if needed.

## Changes Made

### Backend (Python/FastAPI)

#### 1. **Database Schema** (`backend/main.py`)
- Added new `deleted_notes` table to store soft-deleted notes with:
  - Same schema as `notes` table
  - `deleted_at` timestamp to track when notes were deleted
  - Indexes on `user_id` and `deleted_at` for efficient queries

#### 2. **New API Endpoints**

**GET `/api/trash`**
- Retrieves deleted notes for the current user
- Supports pagination (page, limit)
- Returns: list of deleted notes with metadata, total count, and pages

**POST `/api/trash/{note_id}/restore`**
- Restores a deleted note back to the active notes table
- Removes it from the deleted_notes table
- Returns success message

**DELETE `/api/trash/{note_id}`**
- Permanently deletes a note from trash
- Cannot be undone
- Returns success message

#### 3. **Modified Endpoints**

**DELETE `/api/notes/{note_id}`** (Updated)
- Changed from permanent deletion to soft-delete
- Moves note to `deleted_notes` table instead of deleting
- Preserves all note data for potential recovery

### Frontend (React)

#### 1. **NoteViewPage.jsx**
- Updated delete confirmation message to indicate notes go to trash
- Message now: "Move this note to trash? You can recover it later."

#### 2. **New TrashPage.jsx**
- Dedicated page for viewing and managing deleted notes
- Features:
  - Grid layout displaying all deleted notes
  - Shows deletion date for each note
  - Restore button to recover notes
  - Permanent delete button for final removal
  - Pagination for large trash collections
  - Subject badges and tags display
  - Empty state when trash is empty

#### 3. **App.jsx**
- Added route for trash page: `/trash`
- Imported TrashPage component

#### 4. **Sidebar.jsx**
- Added trash link to navigation with 🗑️ icon
- Easy access from any page

## User Workflow

1. **Delete Note**: User clicks delete on a note → moved to trash with confirmation
2. **View Trash**: User navigates to Trash page from sidebar
3. **Recover Note**: User clicks "Restore" → note returns to active notes
4. **Permanent Delete**: User clicks "Permanent" on trash item → permanently deleted with confirmation

## Benefits

✅ **Soft Deletes**: Users never lose data accidentally  
✅ **Recovery Window**: Notes can be recovered until permanently deleted  
✅ **Audit Trail**: `deleted_at` timestamp tracks when notes were removed  
✅ **User-Friendly**: Clear UI for trash management  
✅ **Pagination**: Handles large numbers of deleted notes efficiently  
✅ **Consistent UX**: Follows existing design patterns in the application

## Database Migration Notes

The `init_db()` function will automatically create the `deleted_notes` table on next application startup if it doesn't exist. No manual migration is required.

## API Usage Examples

```bash
# Get trash (page 1, 12 items per page)
GET /api/trash?page=1&limit=12
Authorization: Bearer {token}

# Restore a note
POST /api/trash/{note_id}/restore
Authorization: Bearer {token}

# Permanently delete a note from trash
DELETE /api/trash/{note_id}
Authorization: Bearer {token}

# Delete a note (soft delete to trash)
DELETE /api/notes/{note_id}
Authorization: Bearer {token}
```
