import IngredientsClient from "./IngredientsClient";
import { getIngredientProductIndex } from "@/lib/ingredient-products";

export default function IngredientsPage() {
  return <IngredientsClient productIndex={getIngredientProductIndex()} />;
}
