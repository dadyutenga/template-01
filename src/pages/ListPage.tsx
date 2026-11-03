import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CrudForm, type RecordFormValues } from "@/features/example-crud/CrudForm";
import {
  useRecordsQuery,
  useCreateRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} from "@/features/example-crud/crudApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecordItem, ItemStatus, ItemPriority } from "@/types/crud";

export function ListPage() {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useRecordsQuery();
  const createMutation = useCreateRecordMutation();
  const updateMutation = useUpdateRecordMutation();
  const deleteMutation = useDeleteRecordMutation();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<RecordItem | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: RecordItem) => {
    setEditingRecord(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: RecordFormValues) => {
    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({
          id: editingRecord.id,
          updates: values,
        });
        toast.success(`Record "${values.title}" updated successfully.`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success(`Record "${values.title}" created successfully.`);
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to save record. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Record deleted successfully.");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete record.");
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/30">Pending</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getPriorityBadge = (priority: ItemPriority) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30">High</Badge>;
      case "medium":
        return <Badge variant="outline">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const columns: ColumnDef<RecordItem>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {item.code}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[220px]">
            {item.description}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">{item.category}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (item) => getPriorityBadge(item.priority),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-xs">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.updatedAt, "MMM dd, yyyy")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Records Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete CRUD example featuring searchable, sortable, paginated tables with modal forms.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Create Record</span>
        </Button>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search records by title, code, category..."
        filterOptions={[
          {
            key: "status",
            label: "Filter by Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Pending", value: "pending" },
              { label: "Draft", value: "draft" },
              { label: "Archived", value: "archived" },
            ],
          },
          {
            key: "category",
            label: "Filter by Category",
            options: [
              { label: "Technology", value: "Technology" },
              { label: "Finance", value: "Finance" },
              { label: "Operations", value: "Operations" },
              { label: "Marketing", value: "Marketing" },
              { label: "Human Resources", value: "Human Resources" },
            ],
          },
          {
            key: "priority",
            label: "Filter by Priority",
            options: [
              { label: "Urgent", value: "urgent" },
              { label: "High", value: "high" },
              { label: "Medium", value: "medium" },
              { label: "Low", value: "low" },
            ],
          },
        ]}
        onRowClick={(item) => navigate(`/records/${item.id}`)}
        onView={(item) => navigate(`/records/${item.id}`)}
        onEdit={handleOpenEdit}
        onDelete={(item) => setDeletingId(item.id)}
        exportFileName="records-export.csv"
      />

      {/* Create / Edit Modal Form */}
      <Modal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingRecord ? "Edit Record" : "Create New Record"}
        description={
          editingRecord
            ? "Update the record details and attributes below."
            : "Fill in the required information to add a new record to the system."
        }
      >
        <CrudForm
          initialData={editingRecord || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Record?"
        description="Are you sure you want to delete this record? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default ListPage;
