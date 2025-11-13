import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../lib/products";
import { shopService } from "../../lib/shop";
import { ArrowLeft, Star, Package, Edit2 } from "lucide-react";
import { toast } from "sonner";

export function SellerProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const seller = shopService.getCurrentSeller();

  useEffect(() => {
    if (!seller) {
      navigate("/login");
      return;
    }

    const loadProductData = async () => {
      try {
        // Fetch product
        const productData = await productService.getProductById(Number(id));
        if (productData.shopId !== seller.id) {
          toast.error("You are not allowed to view this product");
          navigate("/seller/products");
          return;
        }
        setProduct(productData);

        // Fetch reviews separately from backend
        const reviewData = await productService.getReviews(Number(id));
        setReviews(reviewData);
      } catch (err) {
        toast.error("Product not found");
        navigate("/seller/products");
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id, seller, navigate]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/seller/products")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex gap-6">
        <img
          src={`http://localhost:3000/uploads/${product.images?.[0]}`}
          alt={product.name}
          className="w-64 h-64 object-cover rounded-lg border"
        />

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <button
              onClick={() => navigate(`/seller/products/edit/${product.id}`)}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          </div>

          <p className="text-gray-700">{product.description}</p>

          <div className="space-y-2">
            <div>
              <span className="font-semibold">Category:</span>{" "}
              {product.category}
            </div>
            <div>
              <span className="font-semibold">Price:</span> $
              {product.discountPrice || product.originalPrice}
              {product.discountPrice && (
                <span className="ml-2 line-through text-gray-500">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Stock: <span className="font-bold">{product.stock}</span>
            </div>

            {product.ratings > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{product.ratings}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

        {reviews.length > 0 ? (
          reviews.map((r: any, index: number) => (
            <div key={index} className="border-b py-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{r.rating}</span>
                <span className="text-gray-600 text-sm">
                  by {r.user.name}
                </span>
              </div>
              <p className="text-gray-700">{r.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
