"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction, updateProductAction } from "@/server/actions/admin-product";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/text";
import { ImageUploader } from "./image-uploader";

const formSchema = z.object({
  name: z.string().min(2, "Enter a product name"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  sku: z.string().min(2, "Enter a SKU"),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive("Enter a valid price"),
  salePrice: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  taxRate: z.coerce.number().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tagsInput: z.string().optional(),
  initialStock: z.coerce.number().int().min(0).optional(),
  images: z.array(z.object({ url: z.string().url("Enter a valid image URL"), altText: z.string().optional() })),
  attributes: z.array(z.object({ key: z.string(), label: z.string(), value: z.string(), unit: z.string().optional() })),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  productId?: string;
  defaultValues?: Partial<FormValues>;
}

export function ProductForm({ categories, brands, productId, defaultValues }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!defaultValues?.slug);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // The explicit cast reconciles a known type-variance quirk between
    // Zod's `z.coerce.number()` fields (whose *input* type before
    // coercion differs from the *output* type after) and react-hook-form's
    // generic — without it, TypeScript sees the resolver as expecting a
    // slightly different shape than the form's declared FormValues, even
    // though the actual runtime behavior is correct.
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      status: "DRAFT",
      isFeatured: false,
      taxRate: 5,
      images: [],
      attributes: [],
      ...defaultValues,
    },
  });

  const imageFields = useFieldArray({ control, name: "images" });
  const attributeFields = useFieldArray({ control, name: "attributes" });

  const nameValue = watch("name");

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const tags = data.tagsInput ? data.tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const payload = {
      ...data,
      salePrice: data.salePrice === "" ? undefined : data.salePrice,
      tags,
    };

    const result = productId
      ? await updateProductAction(productId, payload)
      : await createProductAction(payload);

    if (result && !result.success) {
      setServerError(result.error);
    }
    // On success, the server action redirects — no further handling needed.
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl" noValidate>
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              {...register("name", {
                onChange: (e) => {
                  if (!slugTouched) setValue("slug", slugify(e.target.value));
                },
              })}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">URL Slug</Label>
            <Input id="slug" {...register("slug", { onChange: () => setSlugTouched(true) })} />
            {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} />
            {errors.sku && <p className="text-xs text-red-600">{errors.sku.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select id="categoryId" className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm" {...register("categoryId")}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brandId">Brand</Label>
            <select id="brandId" className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm" {...register("brandId")}>
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input id="shortDescription" {...register("shortDescription")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <textarea
              id="description"
              rows={5}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              {...register("description")}
            />
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Pricing & Stock</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (AED)</Label>
            <Input id="price" type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salePrice">Sale Price (AED)</Label>
            <Input id="salePrice" type="number" step="0.01" {...register("salePrice")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input id="taxRate" type="number" step="0.01" {...register("taxRate")} />
          </div>
          {!productId && (
            <div className="space-y-1.5">
              <Label htmlFor="initialStock">Initial Stock</Label>
              <Input id="initialStock" type="number" {...register("initialStock")} />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">Images</h2>
          <div className="flex items-center gap-3">
            <ImageUploader onUploaded={(url) => imageFields.append({ url, altText: "" })} />
            <button
              type="button"
              onClick={() => imageFields.append({ url: "", altText: "" })}
              className="text-xs font-medium text-orange-600 hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Image URL
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Upload a photo directly from your device, or paste an image URL if you already have one hosted elsewhere.
        </p>
        <div className="space-y-3">
          {imageFields.fields.map((field, i) => {
            const url = watch(`images.${i}.url`);
            return (
              <div key={field.id} className="flex gap-2 items-center">
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-12 w-12 rounded object-cover border border-slate-200 shrink-0" />
                )}
                <Input placeholder="https://..." {...register(`images.${i}.url`)} />
                <Input placeholder="Alt text" className="max-w-[160px]" {...register(`images.${i}.altText`)} />
                <button type="button" onClick={() => imageFields.remove(i)} className="text-slate-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-900">Specifications</h2>
          <button
            type="button"
            onClick={() => attributeFields.append({ key: "", label: "", value: "", unit: "" })}
            className="text-xs font-medium text-orange-600 hover:underline flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add Spec
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Add whatever specs matter for this product category — e.g. Frame Size, Wheel Size, Battery Capacity. These become filterable/searchable automatically.
        </p>
        <div className="space-y-3">
          {attributeFields.fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input placeholder="Spec name (e.g. Frame Size)" {...register(`attributes.${i}.label`, {
                onChange: (e) => setValue(`attributes.${i}.key`, slugify(e.target.value).replace(/-/g, "_")),
              })} />
              <Input placeholder="Value (e.g. Medium)" {...register(`attributes.${i}.value`)} />
              <button type="button" onClick={() => attributeFields.remove(i)} className="text-slate-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Visibility & SEO</h2>
        <div className="space-y-4">
          <div className="flex gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select id="status" className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm" {...register("status")}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mt-6">
              <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 accent-orange-600" />
              Feature on homepage
            </label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagsInput">Tags (comma-separated)</Label>
            <Input id="tagsInput" placeholder="mountain, off-road, aluminum" {...register("tagsInput")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input id="seoTitle" placeholder={nameValue} {...register("seoTitle")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Input id="seoDescription" {...register("seoDescription")} />
          </div>
        </div>
      </section>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{serverError}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : productId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
