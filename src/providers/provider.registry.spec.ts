import { ProviderRegistry } from "./provider.registry";
describe("ProviderRegistry", () => {
  it("resolves brands case-insensitively", () => {
    const provider = {};
    const registry = new ProviderRegistry(
      provider as any,
      provider as any,
      provider as any,
      provider as any,
    );
    expect(registry.get("emart24")).toBe(provider);
    expect(registry.brands()).toHaveLength(4);
  });
});
