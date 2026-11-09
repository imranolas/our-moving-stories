import { priceLabel } from "../lib/schedule";

export const Price = ({ price }: { price?: number }) => <>{priceLabel(price)}</>;
