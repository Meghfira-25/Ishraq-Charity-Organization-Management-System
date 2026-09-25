import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import {
  ok,
  fail,
} from "../utils/http.js";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const uploadsRoot = path.resolve(
  __dirname,
  "../../uploads"
);

const allowed = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const donationProofAllowed = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function saveBase64File({
  file_name,
  mime_type,
  data,
  visibility = "private",
  allowedTypes = allowed,
}) {
  if (!file_name || !mime_type || !data) {
    const error = new Error(
      "file_name, mime_type and base64 data are required"
    );

    error.status = 400;

    throw error;
  }

  const extension =
    allowedTypes[mime_type];

  if (!extension) {
    const error = new Error(
      "File type is not allowed"
    );

    error.status = 400;

    throw error;
  }

  const rawData = String(data).replace(
    /^data:[^;]+;base64,/,
    ""
  );

  const buffer = Buffer.from(
    rawData,
    "base64"
  );

  const maxUploadMb =
    Number(
      process.env.MAX_UPLOAD_MB
    ) || 5;

  const maxBytes =
    maxUploadMb *
    1024 *
    1024;

  if (!buffer.length) {
    const error = new Error(
      "Invalid file data"
    );

    error.status = 400;

    throw error;
  }

  if (buffer.length > maxBytes) {
    const error = new Error(
      `File is too large. Maximum is ${maxUploadMb} MB`
    );

    error.status = 400;

    throw error;
  }

  const directory = path.join(
    uploadsRoot,
    visibility
  );

  await fs.mkdir(
    directory,
    {
      recursive: true,
    }
  );

  const fileName = `${
    Date.now()
  }-${crypto
    .randomBytes(6)
    .toString("hex")}.${extension}`;

  const absolutePath = path.join(
    directory,
    fileName
  );

  await fs.writeFile(
    absolutePath,
    buffer
  );

  const filePath =
    visibility === "public"
      ? `/uploads/public/${fileName}`
      : `/api/uploads/private/${fileName}`;

  return {
    file_name: fileName,
    original_name: file_name,
    mime_type,
    size: buffer.length,
    visibility,
    path: filePath,
  };
}

export async function uploadBase64(
  req,
  res
) {
  try {
    const visibility =
      req.body.visibility === "public"
        ? "public"
        : "private";

    const result =
      await saveBase64File({
        ...req.body,
        visibility,
      });

    return ok(
      res,
      result,
      "File uploaded successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      error.message ||
        "File upload failed",
      error.status || 500
    );
  }
}

export async function uploadDonationProof(
  req,
  res
) {
  try {
    const result =
      await saveBase64File({
        ...req.body,
        visibility: "private",
        allowedTypes:
          donationProofAllowed,
      });

    return ok(
      res,
      result,
      "Donation proof uploaded successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      error.message ||
        "Donation proof upload failed",
      error.status || 500
    );
  }
}

export async function downloadPrivate(
  req,
  res
) {
  try {
    const safeName =
      path.basename(
        req.params.filename
      );

    const filePath =
      path.join(
        uploadsRoot,
        "private",
        safeName
      );

    await fs.access(filePath);

    return res.sendFile(filePath);
  } catch {
    return fail(
      res,
      "File not found",
      404
    );
  }
}

