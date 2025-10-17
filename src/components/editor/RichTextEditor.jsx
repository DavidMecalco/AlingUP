import React, { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import VoiceRecorderButton from './VoiceRecorderButton'

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Describe tu problema...",
  enableVoiceNotes = true,
  enableImageUpload = true,
  disabled = false,
  height = 300
}) => {
  const editorRef = useRef(null)

  const handleEditorChange = (content, editor) => {
    if (onChange) {
      onChange(content)
    }
  }

  const handleImageUpload = (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      // For now, we'll just convert to base64
      // In a real implementation, you'd upload to Supabase Storage
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.onerror = () => {
        reject('Error reading file')
      }
      reader.readAsDataURL(blobInfo.blob())
    })
  }

  const editorConfig = {
    height: height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'codesample', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
    ],
    toolbar: [
      'undo redo | formatselect | bold italic underline strikethrough',
      'forecolor backcolor | alignleft aligncenter alignright alignjustify',
      'bullist numlist outdent indent | blockquote codesample',
      'link image media table | code fullscreen help'
    ].join(' | '),
    toolbar_mode: 'sliding',
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
      }
      pre {
        background-color: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        overflow-x: auto;
      }
      blockquote {
        border-left: 4px solid #e5e7eb;
        margin: 16px 0;
        padding-left: 16px;
        color: #6b7280;
        font-style: italic;
      }
    `,
    placeholder: placeholder,
    branding: false,
    resize: false,
    statusbar: true,
    elementpath: false,
    block_formats: 'Párrafo=p; Encabezado 1=h1; Encabezado 2=h2; Encabezado 3=h3; Preformateado=pre',
    font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino; Helvetica=helvetica; Times New Roman=times new roman,times; Verdana=verdana,geneva',
    images_upload_handler: enableImageUpload ? handleImageUpload : undefined,
    automatic_uploads: true,
    file_picker_types: enableImageUpload ? 'image' : '',
    images_file_types: 'jpg,jpeg,png,gif',
    file_picker_callback: enableImageUpload ? (callback, value, meta) => {
      if (meta.filetype === 'image') {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif')
        
        input.addEventListener('change', (e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.addEventListener('load', () => {
              callback(reader.result, {
                alt: file.name,
                title: file.name
              })
            })
            reader.readAsDataURL(file)
          }
        })
        
        input.click()
      }
    } : undefined,
    codesample_languages: [
      { text: 'HTML/XML', value: 'markup' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'CSS', value: 'css' },
      { text: 'PHP', value: 'php' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C#', value: 'csharp' },
      { text: 'C++', value: 'cpp' },
      { text: 'SQL', value: 'sql' },
      { text: 'JSON', value: 'json' },
      { text: 'Bash', value: 'bash' }
    ],
    setup: (editor) => {
      // Add custom file attachment button
      editor.ui.registry.addButton('attachment', {
        text: '📎',
        tooltip: 'Adjuntar archivo',
        onAction: () => {
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', '.pdf,.doc,.docx,.txt,.zip,.rar')
          
          input.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (file) {
              // Insert a link to the file (in a real implementation, you'd upload to storage)
              const fileName = file.name
              const fileSize = (file.size / 1024).toFixed(1) + ' KB'
              editor.insertContent(`<p>📎 <strong>Archivo adjunto:</strong> ${fileName} (${fileSize})</p>`)
            }
          })
          
          input.click()
        }
      })

      // Add voice note button if enabled
      if (enableVoiceNotes) {
        editor.ui.registry.addButton('voicenote', {
          text: '🎤',
          tooltip: 'Grabar nota de voz',
          onAction: () => {
            // Trigger the external voice recorder
            const voiceButton = document.querySelector('.voice-recorder-button')
            if (voiceButton) {
              voiceButton.click()
            }
          }
        })
      }

      // Update toolbar to include new buttons
      const baseToolbar = [
        'undo redo | formatselect | bold italic underline strikethrough',
        'forecolor backcolor | alignleft aligncenter alignright alignjustify',
        'bullist numlist outdent indent | blockquote codesample',
        'link image attachment | code fullscreen help'
      ]

      if (enableVoiceNotes) {
        baseToolbar[baseToolbar.length - 1] += ' | voicenote'
      }

      editor.settings.toolbar = baseToolbar.join(' | ')
    }
  }

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="no-api-key" // Using TinyMCE without API key (limited features)
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={editorConfig}
        disabled={disabled}
      />
      
      {/* Voice Recording Controls (if enabled) */}
      {enableVoiceNotes && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>Nota de Voz:</strong> Graba audio para complementar tu descripción
            </div>
            <VoiceRecorderButton
              onRecording={(audioBlob) => {
                // For now, we'll just show a success message
                // In a real implementation, you'd upload to Supabase Storage
                console.log('Audio recorded:', audioBlob)
                alert('Nota de voz grabada exitosamente (funcionalidad de guardado próximamente)')
              }}
              disabled={disabled}
            />
          </div>
        </div>
      )}
      
      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>
          <strong>Formato disponible:</strong> Negrita, cursiva, subrayado, listas, citas, código
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
        <p>
          <strong>Consejos:</strong> Usa el botón de código para insertar fragmentos de código, y el botón de adjuntos para documentos
        </p>
      </div>
    </div>
  )
}

export default RichTextEditor