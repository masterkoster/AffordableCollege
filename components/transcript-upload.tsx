"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TranscriptUploadProps {
  onAnalyze: () => void
  isAnalyzing: boolean
}

export function TranscriptUpload({ onAnalyze, isAnalyzing }: TranscriptUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    }
  }, [])

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 text-center",
          isDragging
            ? "border-accent bg-accent/10 scale-[1.02]"
            : file
            ? "border-accent bg-accent/5"
            : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />
        
        <div className="flex flex-col items-center gap-4">
          {file ? (
            <>
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ready to analyze your transcript
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Drop your transcript here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse for a PDF file
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <FileText className="w-4 h-4" />
                <span>Supports PDF transcripts from Michigan community colleges</span>
              </div>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={onAnalyze}
        disabled={!file || isAnalyzing}
        size="lg"
        className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing Credits...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Scan & Analyze
          </>
        )}
      </Button>
    </div>
  )
}
