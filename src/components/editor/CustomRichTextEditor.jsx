import { useRef, useState, useEffect } from 'react'
import VoiceRecorderButton from './VoiceRecorderButton'
import './CustomRichTextEditor.css'

const CustomRichTextEditor = ({
    value,
    onChange,
    placeholder = "Describe tu problema...",
    enableVoiceNotes = true,
    enableImageUpload = true,
    disabled = false,
    height = 300
}) => {
    const editorRef = useRef(null)
    const fileInputRef = useRef(null)
    const imageInputRef = useRef(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showCodeInput, setShowCodeInput] = useState(false)
    const [codeInput, setCodeInput] = useState('')

    // Sync value with editor content
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || ''
        }
    }, [value])

    const handleContentChange = () => {
        if (onChange && editorRef.current) {
            const content = editorRef.current.innerHTML
            onChange(content)
        }
    }

    const insertAtCursor = (html) => {
        if (editorRef.current) {
            editorRef.current.focus()

            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents()

                const div = document.createElement('div')
                div.innerHTML = html
                const fragment = document.createDocumentFragment()

                while (div.firstChild) {
                    fragment.appendChild(div.firstChild)
                }

                range.insertNode(fragment)
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
            } else {
                // If no selection, append at the end
                editorRef.current.innerHTML += html
            }

            handleContentChange()
        }
    }

    const formatText = (command) => {
        if (editorRef.current) {
            editorRef.current.focus()
            
            // Use modern approach instead of deprecated execCommand
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                const selectedText = range.toString()
                
                if (selectedText) {
                    let wrappedText = ''
                    switch (command) {
                        case 'bold':
                            wrappedText = `<strong>${selectedText}</strong>`
                            break
                        case 'italic':
                            wrappedText = `<em>${selectedText}</em>`
                            break
                        case 'underline':
                            wrappedText = `<u>${selectedText}</u>`
                            break
                        default:
                            wrappedText = selectedText
                    }
                    
                    range.deleteContents()
                    const div = document.createElement('div')
                    div.innerHTML = wrappedText
                    const fragment = document.createDocumentFragment()
                    while (div.firstChild) {
                        fragment.appendChild(div.firstChild)
                    }
                    range.insertNode(fragment)
                    range.collapse(false)
                    selection.removeAllRanges()
                    selection.addRange(range)
                    
                    handleContentChange()
                }
            }
        }
    }

    const createList = (ordered = false) => {
        if (editorRef.current) {
            editorRef.current.focus()
            
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                const selectedText = range.toString() || 'Elemento de lista'
                
                const listHtml = ordered 
                    ? `<ol><li>${selectedText}</li></ol><br/>`
                    : `<ul><li>${selectedText}</li></ul><br/>`
                
                range.deleteContents()
                const div = document.createElement('div')
                div.innerHTML = listHtml
                const fragment = document.createDocumentFragment()
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild)
                }
                range.insertNode(fragment)
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
                
                handleContentChange()
            }
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const img = `<img src="${event.target.result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" />`
                insertAtCursor(img)
            }
            reader.readAsDataURL(file)
        }
        // Reset input
        e.target.value = ''
    }

    const handleFileAttachment = (e) => {
        const file = e.target.files[0]
        if (file) {
            const fileSize = (file.size / 1024).toFixed(1) + ' KB'
            const attachment = `<div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; margin: 8px 0; display: inline-block; font-family: system-ui;">
        📎 <strong>Archivo adjunto:</strong> ${file.name} (${fileSize})
      </div><br/>`
            insertAtCursor(attachment)
        }
        // Reset input
        e.target.value = ''
    }

    const insertCodeBlock = () => {
        setShowCodeInput(true)
        setCodeInput('')
    }

    const handleCodeSubmit = () => {
        if (codeInput.trim()) {
            const codeBlock = `<pre style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: 'Courier New', monospace; overflow-x: auto; margin: 10px 0; white-space: pre-wrap;"><code>${codeInput}</code></pre><br/>`
            insertAtCursor(codeBlock)
        }
        setShowCodeInput(false)
        setCodeInput('')
    }

    const handleCodeCancel = () => {
        setShowCodeInput(false)
        setCodeInput('')
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-2">
                <div className="flex flex-wrap gap-1">
                    {/* Text Formatting */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                            type="button"
                            onClick={() => formatText('bold')}
                            className="toolbar-btn"
                            title="Negrita"
                            disabled={disabled}
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            type="button"
                            onClick={() => formatText('italic')}
                            className="toolbar-btn"
                            title="Cursiva"
                            disabled={disabled}
                        >
                            <em>I</em>
                        </button>
                        <button
                            type="button"
                            onClick={() => formatText('underline')}
                            className="toolbar-btn"
                            title="Subrayado"
                            disabled={disabled}
                        >
                            <u>U</u>
                        </button>
                    </div>

                    {/* Lists */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                            type="button"
                            onClick={() => createList(false)}
                            className="toolbar-btn"
                            title="Lista con viñetas"
                            disabled={disabled}
                        >
                            • Lista
                        </button>
                        <button
                            type="button"
                            onClick={() => createList(true)}
                            className="toolbar-btn"
                            title="Lista numerada"
                            disabled={disabled}
                        >
                            1. Lista
                        </button>
                    </div>

                    {/* Code and Media */}
                    <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                            type="button"
                            onClick={insertCodeBlock}
                            className="toolbar-btn"
                            title="Insertar código"
                            disabled={disabled}
                        >
                            💻 Código
                        </button>
                        {enableImageUpload && (
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="toolbar-btn"
                                title="Insertar imagen"
                                disabled={disabled}
                            >
                                🖼️ Imagen
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="toolbar-btn"
                            title="Adjuntar archivo"
                            disabled={disabled}
                        >
                            📎 Adjunto
                        </button>
                    </div>

                    {/* Expand/Collapse */}
                    <button
                        type="button"
                        onClick={toggleExpanded}
                        className="toolbar-btn ml-auto"
                        title={isExpanded ? "Contraer" : "Expandir"}
                        disabled={disabled}
                    >
                        {isExpanded ? "⬇️" : "⬆️"}
                    </button>
                </div>
            </div>

            {/* Code Input Modal */}
            {showCodeInput && (
                <div className="bg-blue-50 border-b border-blue-200 p-3">
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                            Insertar código:
                        </label>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            className="w-full p-2 border border-blue-300 rounded font-mono text-sm"
                            rows={4}
                            placeholder="Escribe tu código aquí..."
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCodeSubmit}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            Insertar
                        </button>
                        <button
                            type="button"
                            onClick={handleCodeCancel}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable={!disabled}
                onInput={handleContentChange}
                onBlur={handleContentChange}
                className="p-3 focus:outline-none overflow-y-auto prose max-w-none"
                style={{
                    minHeight: `${height}px`,
                    maxHeight: isExpanded ? '600px' : `${height}px`,
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal'
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />

            {/* Hidden File Inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageUpload}
                className="hidden"
            />
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                onChange={handleFileAttachment}
                className="hidden"
            />

            {/* Voice Recording Controls */}
            {enableVoiceNotes && (
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <strong>Nota de Voz:</strong> Graba audio para complementar tu descripción
                        </div>
                        <VoiceRecorderButton
                            onRecording={(audioBlob) => {
                                console.log('Audio recorded:', audioBlob)
                                const audioNote = `<div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 8px; margin: 8px 0; display: inline-block; font-family: system-ui;">
                  🎤 <strong>Nota de voz grabada</strong> (${(audioBlob.size / 1024).toFixed(1)} KB)
                </div><br/>`
                                insertAtCursor(audioNote)
                            }}
                            disabled={disabled}
                        />
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                <p>
                    <strong>Formato disponible:</strong> Negrita, cursiva, subrayado, listas, código
                </p>
                {enableImageUpload && (
                    <p>
                        <strong>Multimedia:</strong> Imágenes (JPG/PNG), archivos adjuntos (PDF, DOC, ZIP)
                    </p>
                )}
                {enableVoiceNotes && (
                    <p>
                        <strong>Audio:</strong> Graba notas de voz para complementar tu descripción
                    </p>
                )}
            </div>
        </div>
    )
}

export default CustomRichTextEditor