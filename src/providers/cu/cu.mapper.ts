import { Product } from "../../common/types/product.type";
import { Store } from "../../common/types/store.type";
export const mapCuProducts = (b: any): Product[] => {
  const rows = b?.data?.stockResult?.result?.rows ?? [];
  return rows
    .map((r: any) => r.fields)
    .filter((x: any) => x?.item_cd)
    .map((x: any) => ({
      brand: "CU",
      productCode: String(x.item_cd),
      barcode: x.barcode,
      name: String(x.item_nm ?? ""),
      price: Number(x.hyun_maega) || undefined,
      raw: x,
    }));
};
export const mapCuStores = (html: string): Store[] => {
  const rows = html.match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
  return rows.flatMap((row) => {
    const code = row.match(/searchLatLng\('[^']*',\s*'([^']+)'\)/)?.[1];
    const name = row
      .match(/<span class="name">([\s\S]*?)<\/span>/)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .trim();
    if (!code) return [];
    return [
      {
        brand: "CU",
        storeCode: code,
        name: (name ?? "").replace(/\s+/g, " "),
        raw: row,
      },
    ];
  });
};
