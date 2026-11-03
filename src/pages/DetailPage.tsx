import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Calendar,
  User,
  Tag,
  DollarSign,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PrintableDocument } from "@/components/shared/PrintableDocument";
import { CopyButton } from "@/components/shared/CopyButton";
import { Modal } from "@/components/shared/Modal";
import { CrudForm, type RecordFormValues } from "@/features/example-crud/CrudForm";
import {
  useRecordQuery,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} from "@/features/example-crud/crudApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading } = useRecordQuery(id);
  const updateMutation = useUpdateRecordMutation();
  const deleteMutation = useDeleteRecordMutation();

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isPrintOpen, setIsPrintOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-32 w-full bg-muted rounded-xl" />
        <div className="h-64 w-full bg-muted rounded-xl" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <h2 className="text-lg font-bold">Record Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The requested record ID does not exist or may have been deleted.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/records">Back to Records</Link>
        </Button>
      </div>
    );
  }

  const handleUpdate = async (values: RecordFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        updates: values,
      });
      toast.success("Record updated successfully.");
      setIsEditOpen(false);
    } catch {
      toast.error("Failed to update record.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(record.id);
      toast.success("Record deleted successfully.");
      navigate("/records");
    } catch {
      toast.error("Failed to delete record.");
    }
  };

  const activityHistory: ActivityItem[] = [
    {
      id: "hist-1",
      user: { name: record.assignedTo },
      action: "updated",
      target: `Record details and status to ${record.status}`,
      timestamp: record.updatedAt,
      type: "update",
    },
    {
      id: "hist-2",
      user: { name: record.assignedTo },
      action: "created",
      target: `Record initialized with code ${record.code}`,
      timestamp: record.createdAt,
      type: "create",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top back navigation and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9">
            <Link to="/records" aria-label="Back to records">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {record.code}
              </span>
              <CopyButton value={record.code} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mt-1">
              {record.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPrintOpen(true)} className="gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Print View</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-1.5">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity & Audit</TabsTrigger>
          <TabsTrigger value="documents">Attached Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Record Details</CardTitle>
                <CardDescription>
                  Core properties and administrative information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    Description
                  </h4>
                  <p className="mt-1 leading-relaxed text-foreground">
                    {record.description || "No description provided for this record."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assignee</p>
                      <p className="font-medium text-foreground">{record.assignedTo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">{record.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Valuation Amount</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(record.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created On</p>
                      <p className="font-medium text-foreground">
                        {formatDate(record.createdAt, "PPP")}
                      </p>
                    </div>
                  </div>
                </div>

                {record.tags && record.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {record.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status & Metadata Side Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status & Lifecycle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Operational Status</p>
                  <div className="mt-1">
                    <Badge className="capitalize text-xs font-semibold">
                      {record.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Priority Tier</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize text-xs font-semibold">
                      {record.priority}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Last modified:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(record.updatedAt, "MMM d, HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Record ID:</span>
                    <span className="font-mono text-[11px] text-foreground">
                      {record.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Trail & Modifications</CardTitle>
              <CardDescription>
                Chronological ledger of changes made to this record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed items={activityHistory} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Associated Files</CardTitle>
              <CardDescription>
                Documents and attachments linked to {record.code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Official_Summary_{record.code}.pdf</p>
                    <p className="text-xs text-muted-foreground">PDF Document &bull; 2.4 MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsPrintOpen(true)}>
                  Preview Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Modal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Record"
        description="Modify attributes and update record information."
      >
        <CrudForm
          initialData={record}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditOpen(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Record"
        description={`Are you sure you want to delete ${record.title} (${record.code})? This action cannot be reversed.`}
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Printable Document Modal */}
      <Modal
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        title="Print Document Preview"
        className="sm:max-w-4xl"
      >
        <PrintableDocument
          title={record.title}
          documentNumber={record.code}
          date={record.createdAt}
          author={record.assignedTo}
          status={record.status.toUpperCase()}
        >
          <div className="space-y-4">
            <p>
              <strong>Summary:</strong> {record.description || "No description provided."}
            </p>
            <table className="w-full text-left border text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="p-2">Attribute</th>
                  <th className="p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Category</td>
                  <td className="p-2">{record.category}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Assignee</td>
                  <td className="p-2">{record.assignedTo}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Priority</td>
                  <td className="p-2">{record.priority}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Valuation Amount</td>
                  <td className="p-2 font-bold">{formatCurrency(record.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PrintableDocument>
      </Modal>
    </div>
  );
}

export default DetailPage;
