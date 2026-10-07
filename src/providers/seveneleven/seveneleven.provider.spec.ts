import { SevenElevenProvider } from "./seveneleven.provider";
describe("SevenElevenProvider", () => {
  it("maps product fields", async () => {
    const client: any = {
      products: jest
        .fn()
        .mockResolvedValue({
          data: {
            SearchQueryResult: {
              Collection: [
                {
                  Documentset: {
                    Document: [{ field: { itemCd: "7", itemOnm: "상품" } }],
                  },
                },
              ],
            },
          },
        }),
      stores: jest.fn(),
    };
    expect(
      await new SevenElevenProvider(client).searchProducts("상품"),
    ).toMatchObject([
      { brand: "SEVEN_ELEVEN", productCode: "7", name: "상품" },
    ]);
  });
  it("uses stock metadata when looking up inventory", async () => {
    const client: any = {
      stockMeta: jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              prdNo: "P1",
              itemCd: "I1",
              itemOnm: "상품",
              smCd: "SM",
              stokMngCd: "STOCK",
              stokMngQty: 1,
              stockApplicationRate: "100",
            },
          ],
        },
      }),
      stock: jest.fn().mockResolvedValue({
        storeList: [{ storeCd: "S1", stock: 2 }],
      }),
    };

    await expect(
      new SevenElevenProvider(client).getInventory("I1", ["S1"]),
    ).resolves.toMatchObject([
      { brand: "SEVEN_ELEVEN", productCode: "I1", storeCode: "S1", quantity: 2 },
    ]);
    expect(client.stock).toHaveBeenCalledWith({
      smCd: "SM",
      stokMngCd: "STOCK",
      stokMngQty: 1,
      stockApplicationRate: "100",
      storeList: ["S1"],
    });
  });
});
