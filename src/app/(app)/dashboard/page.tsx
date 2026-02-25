"use client";

import { useTranscripts, useDeleteTranscript } from "@/hooks";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  MoreVertical, 
  ExternalLink,
  ChevronRight,
  Languages,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Transcript } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: transcripts = [], isLoading } = useTranscripts();
  const deleteMutation = useDeleteTranscript();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Transcript deleted");
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
    } catch (_error) {
      toast.error("Failed to delete transcript");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Transcripts</h2>
          <p className="text-muted-foreground">
            Manage and view all your voice recordings and translations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Dictation
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-blue-500/10 bg-blue-500/5 dark:bg-blue-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">Total Transcripts</CardDescription>
            <CardTitle className="text-3xl font-bold">{transcripts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last updated just now</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Total Words</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {transcripts.reduce((acc, t) => acc + (t.wordCount || 0), 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all transcripts</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium">Languages</CardDescription>
            <CardTitle className="text-3xl font-bold">4</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Hausa, Yoruba, Igbo, English</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden border-muted">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transcripts..." className="pl-9 h-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading transcripts...</p>
            </div>
          ) : transcripts.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No transcripts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Once you start dictating or upload audio, your transcripts will appear here.
              </p>
              <Link href="/app">
                <Button variant="outline" className="gap-2">
                  Start your first dictation <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6">Transcript Name</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {transcripts.map((transcript: Transcript) => (
                    <motion.tr
                      key={transcript.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group"
                    >
                      <TableCell className="font-medium pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                              {transcript.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {transcript.originalText}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-muted/50 font-normal">
                          <Languages className="mr-1 h-3 w-3" />
                          English
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transcript.wordCount} words
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(transcript.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/${transcript.id}`} className="flex items-center cursor-pointer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                              onClick={() => handleDelete(transcript.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
