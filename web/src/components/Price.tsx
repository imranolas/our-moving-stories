export const Price = ({ price }: { price: number }) => {
  if (price === 0) {
    return "Free";
  } else {
    return `£${price}`;
  }
};
