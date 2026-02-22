"use client";

import { useRouter } from "next/navigation";
import ContentForm from "@/components/admin/ContentForm";

export default function NewContentPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">הוסף תוכן</h1>
      <ContentForm
        onSaved={(id) => router.push(`/admin/content/${id}`)}
        onCancel={() => router.push("/admin/content")}
      />
    </div>
  );
}
