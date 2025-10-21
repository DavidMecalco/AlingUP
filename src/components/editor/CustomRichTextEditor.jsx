import { useRef, useState, useEffect } from 'react'
import VoiceRecorderButton from './VoiceRecorderButton'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Code, 
  Image, 
  Paperclip, 
  Mic,
  Maximize2,
  Minimize2,
  Check,
  X
} from 'lucide-react'
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
        if (editorRef.current) {
            const currentContent = editorRef.current.innerHTML
            const newValue = value || ''
            
            // Only update if content is different to avoid cursor issues
            if (currentContent !== newValue) {
                editorRef.current.innerHTML = newValue
            }
        }
    }, [value])

    const handleContentChange = () => {
        if (onChange && editorRef.current) {
            const content = editorRef.current.innerHTML
            onChange(content)
        }
    }

    // Handle paste events to clean up formatting
    const handlePaste = (e) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, text)
        handleContentChange()
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
            
            // Use execCommand for better compatibility
            try {
                document.execCommand(command, false, null)
                handleContentChange()
            } catch (error) {
                console.warn('Format command failed:', error)
                
                // Fallback to manual formatting
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
    }

    const createList = (ordered = false) => {
        if (editorRef.current) {
            editorRef.current.focus()
            
            try {
                // Use execCommand for better list handling
                const command = ordered ? 'insertOrderedList' : 'insertUnorderedList'
                document.execCommand(command, false, null)
                handleContentChange()
            } catch (error) {
                console.warn('List command failed:', error)
                
                // Fallback to manual list creation
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
            const fileSize = file.size > 1024 * 1024 
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(1) + ' KB'
            const attachment = `<div class="attachment">📎 <strong>Archivo adjunto:</strong> ${file.name} (${fileSize})</div><br/>`
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
            const escapedCode = codeInput
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
            const codeBlock = `<pre><code>${escapedCode}</code></pre><br/>`
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
        <div className="rich-text-editor glass-morphism rounded-2xl overflow-hidden">
            {/* Glass Toolbar */}
            <div className="toolbar glass-morphism border-b border-white/10 p-3">
                <div className="flex flex-wrap gap-2">
                    {/* Text Formatting */}
                    <div className="flex gap-2 border-r border-white/20 pr-3 mr-3">
                        <button
                            type="button"
                            onClick={() => formatText('bold')}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Negrita"
                            disabled={disabled}
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => formatText('italic')}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Cursiva"
                            disabled={disabled}
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => formatText('underline')}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Subrayado"
                            disabled={disabled}
                        >
                            <Underline className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Lists */}
                    <div className="flex gap-2 border-r border-white/20 pr-3 mr-3">
                        <button
                            type="button"
                            onClick={() => createList(false)}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Lista con viñetas"
                            disabled={disabled}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => createList(true)}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Lista numerada"
                            disabled={disabled}
                        >
                            <ListOrdered className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Code and Media */}
                    <div className="flex gap-2 border-r border-white/20 pr-3 mr-3">
                        <button
                            type="button"
                            onClick={insertCodeBlock}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Insertar código"
                            disabled={disabled}
                        >
                            <Code className="w-4 h-4" />
                        </button>
                        {enableImageUpload && (
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="toolbar-btn glass-button p-2 rounded-xl"
                                title="Insertar imagen"
                                disabled={disabled}
                            >
                                <Image className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="toolbar-btn glass-button p-2 rounded-xl"
                            title="Adjuntar archivo"
                            disabled={disabled}
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Expand/Collapse */}
                    <button
                        type="button"
                        onClick={toggleExpanded}
                        className="toolbar-btn glass-button p-2 rounded-xl ml-auto"
                        title={isExpanded ? "Contraer" : "Expandir"}
                        disabled={disabled}
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Code Input Modal */}
            {showCodeInput && (
                <div className="glass-morphism bg-blue-500/10 border-b border-white/10 p-4 animate-slide-in">
                    <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Code className="w-4 h-4 text-blue-400" />
                            <label className="text-sm font-medium text-white">
                                Insertar código:
                            </label>
                        </div>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            className="glass-input w-full p-3 rounded-xl font-mono text-sm text-white placeholder-white/50 bg-black/20"
                            rows={4}
                            placeholder="Escribe tu código aquí..."
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCodeSubmit}
                            className="glass-button px-4 py-2 rounded-xl text-white font-medium bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 flex items-center space-x-2"
                        >
                            <Check className="w-4 h-4" />
                            <span>Insertar</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCodeCancel}
                            className="glass-button px-4 py-2 rounded-xl text-white font-medium bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancelar</span>
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
                onPaste={handlePaste}
                className="editor-content p-4 focus:outline-none overflow-y-auto text-white"
                style={{
                    minHeight: `${height}px`,
                    maxHeight: isExpanded ? '600px' : `${height}px`,
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal',
                    lineHeight: '1.6',
                    fontSize: '14px'
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
                <div className="glass-morphism border-t border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Mic className="w-4 h-4 text-green-400" />
                            <div className="text-sm text-white/80">
                                <strong className="text-white">Nota de Voz:</strong> Graba audio para complementar tu descripción
                            </div>
                        </div>
                        <VoiceRecorderButton
                            onRecording={(audioBlob) => {
                                console.log('Audio recorded:', audioBlob)
                                const audioNote = `<div class="voice-note">
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
            <div className="glass-morphism border-t border-white/10 p-3 text-xs text-white/70 space-y-1">
                <p>
                    <strong className="text-white/90">Formato disponible:</strong> Negrita, cursiva, subrayado, listas, código
                </p>
                {enableImageUpload && (
                    <p>
                        <strong className="text-white/90">Multimedia:</strong> Imágenes (JPG/PNG), archivos adjuntos (PDF, DOC, ZIP)
                    </p>
                )}
                {enableVoiceNotes && (
                    <p>
                        <strong className="text-white/90">Audio:</strong> Graba notas de voz para complementar tu descripción
                    </p>
                )}
            </div>
        </div>
    )
}

export default CustomRichTextEditor