import React, { useState, useEffect } from 'react';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { graphqlOperation, API,  } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions'

function App() {
  const [note, setNote] = useState('')
  const [activeId, setActiveId] = useState()
  const [notes, setNotes] = useState([])

  useEffect(() => {
    getNotes()

    const onCreateNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: () => getNotes()
    })

    const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: () => getNotes()
    })
    
    const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: () => getNotes()
    })

    return () => {
      onCreateNoteListener()
      deleteNoteListener()
      updateNoteListener()
    }
  }, [])

  const getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes))
      setNotes(result.data.listNotes.items)
  }

  const handleAddNote = async (event) => {
    event.preventDefault()
    if(activeId) {
      const input = {
        id: activeId,
        note
      }
      await API.graphql(graphqlOperation(updateNote, {
        input
      }))
    } else {
      const input = { note }
      await API.graphql(graphqlOperation(createNote, {
        input
      }))
    }

    setNote('')
  }

  const handleDeleteNote = async noteId => {
    const input  = { id: noteId}
    await API.graphql(graphqlOperation(deleteNote, {
      input
    }))
  }
  
  return (
    <div className='flex flex-column items-center justify-center pa3 bg-washed-red'>
      <h1 className='cod f2-1'>
        Amplify Notetaker
      </h1>
      {/* Note Form */}
      <form onSubmit={handleAddNote} className='mb3'>
        <input type='text' className='pa2 f4' 
          placeholder='Write your note'
          value={note}
          onChange={e => {
            setNote(e.target.value)
          }}
        />
        <button className='pa2 f4' type='submit'>
          {activeId ? 'Update' : 'Add'} Note
        </button>
      </form>

      {/* Note List */}
      {notes.map(item => (
        <div key={item.id} className='flex items-center'>
          <li onClick={() => {
            setNote(item.note)
            setActiveId(item.id)
          }} className='list pa1 f3'>{item.note}</li>
          <button className='bg-transparent bn f4' onClick={() => handleDeleteNote(item.id)}>
            <span>&times;</span>
          </button>
        </div>
      ))}

      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App, {
  includeGreetings: true
});
