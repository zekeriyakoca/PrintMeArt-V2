import {ProductDto} from "../../models/product";
import {CategoryDto} from "../../models/category";
import {AttributeGroupDto} from "../../models/attirubuteGroup";
import {ProductTags} from "../../models/productTags";
import {SelectDto} from "../../models/select";

export const ATTRIBUTE_GROUPS: AttributeGroupDto[] = [
  {
    id: 1,
    name: "Appearance",
    description: "Attributes related to appearance",
  },
  {
    id: 2,
    name: "Specifications",
    description: "Attributes related to specifications",
  },
  {
    id: 3,
    name: "Size",
    description: "Attributes related to size",
  },
  {
    id: 4,
    name: "Color",
    description: "Attributes related to color",
  },
  {
    id: 5,
    name: "Material",
    description: "Attributes related to material",
  }
];

export const PRICE_POLICY_OPTIONS: SelectDto[] = [
  {
    value: 'SquarePricePolicy',
    name: "Square Price Policy",
    description: "Square Price Policy (edge * edge)",
  },
  {
    value: 'RectangleBasePricePolicy',
    name: "Rectangle Price Policy",
    description: "Rectangle Price Policy (width * height)",
  },
  {
    value: 'CirclePricePolicy',
    name: "Circle Price Policy",
    description: "Circle Price Policy (PI * radius * radius)",
  },
  {
    value: 'FixedPricePolicy',
    name: "Fixed Price Policy",
    description: "Fixed Price Policy (base price)",
  },
  {
    value: 'PercentageDiscountPricePolicy',
    name: "Percentage Discount Price Policy",
    description: "Percentage Discount Price Policy (base price - (base price * discount / 100))",
  },
  {
    value: 'FramePricePolicy',
    name: "Frame Price Policy",
    description: "Frame Price Policy (frame base price * (width * height))",
  }
];


export const PRODUCTS: ProductDto[] = [];
