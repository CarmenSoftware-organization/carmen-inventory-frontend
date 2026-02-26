"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useGoodsReceiveNoteById } from "@/hooks/use-goods-receive-note";
import { GrnForm } from "../_components/grn-form";

export default createEditPage({
  useById: useGoodsReceiveNoteById,
  notFoundMessage: "Goods receive note not found",
  render: (goodsReceiveNote) => <GrnForm goodsReceiveNote={goodsReceiveNote} />,
});
