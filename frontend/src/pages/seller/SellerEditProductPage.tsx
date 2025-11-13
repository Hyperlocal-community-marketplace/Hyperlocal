import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../lib/products";
import { shopService } from "../../lib/shop";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type FormState = {
  name: string;
  description: string;
  originalPrice: string;
  discountPrice: string;
  stock: string;
  category: string;
};

export default function SellerEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const seller = shopService.getCurrentSeller();

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const productId = Number(id || 0);

  useEffect(() => {
    if (!seller) {
      navigate("/login");
      return;
    }

    const loadProduct = async () => {
      try {
        const data = await productService.getProductById(productId);
        if (!data) throw new Error("Product not found");

        if (data.shopId !== seller.id) {
          toast.error("Unauthorized");
          navigate("/seller/products");
          return;
        }

        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          originalPrice:
            data.originalPrice != null ? String(data.originalPrice) : "",
          discountPrice:
            data.discountPrice != null ? String(data.discountPrice) : "",
          stock: data.stock != null ? String(data.stock) : "",
          category: data.category ?? "",
        });

        if (Array.isArray(data.images) && data.images.length > 0) {
          // If your backend returns filename, prefix with your base uploads url if needed
          setImagePreview(data.images[0]);
        }
      } catch (err) {
        console.error("loadProduct error:", err);
        toast.error("Product not found or can't be loaded");
        navigate("/seller/products");
      }
    };

    if (productId) loadProduct();
  }, [productId, seller, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("originalPrice", form.originalPrice);
      fd.append("discountPrice", form.discountPrice);
      fd.append("stock", form.stock);
      fd.append("category", form.category);

      if (imageFile) fd.append("images", imageFile);

      const res = await productService.updateProduct(productId, fd);

      if (res.success) {
        toast.success("Product updated ✅");
        navigate(`/seller/products/${productId}`);
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch (err: any) {
      console.error("update error:", err);
      toast.error(err?.message || "Failed to update product");
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div>
          <label className="block mb-1 font-medium">Product Name</label>
          <input
            name="name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Original Price</label>
            <input
              name="originalPrice"
              type="number"
              className="w-full border p-2 rounded"
              value={form.originalPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1 font-medium">Discount Price</label>
            <input
              name="discountPrice"
              type="number"
              className="w-full border p-2 rounded"
              value={form.discountPrice}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              className="w-full border p-2 rounded"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1 font-medium">Category</label>
            <input
              name="category"
              className="w-full border p-2 rounded"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Replace Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="preview"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
