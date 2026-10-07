import { CuProvider } from "./cu.provider";
describe("CuProvider", () => {
  it("maps product fields", async () => {
    const client: any = {
      products: jest
        .fn()
        .mockResolvedValue({
          data: {
            stockResult: {
              result: {
                rows: [
                  {
                    fields: {
                      item_cd: "C1",
                      item_nm: "상품",
                      hyun_maega: "1200",
                    },
                  },
                ],
              },
            },
          },
        }),
      stores: jest.fn(),
    };
    expect(await new CuProvider(client).searchProducts("상품")).toMatchObject([
      { brand: "CU", productCode: "C1", name: "상품", price: 1200 },
    ]);
  });
  it("leaves unverified inventory unimplemented", async () => {
    await expect(
      new CuProvider({} as any).getInventory("C1", ["S1"]),
    ).rejects.toMatchObject({ code: "NOT_IMPLEMENTED" });
  });
});
