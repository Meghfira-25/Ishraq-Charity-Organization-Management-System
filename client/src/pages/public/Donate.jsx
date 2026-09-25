import { useEffect, useMemo, useState } from "react";

import {
  Check,
  Copy,
  FileImage,
  Landmark,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { bankAccounts } from "../../config/bankAccounts.js";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const initial = {
  is_anonymous: false,
  full_name: "",
  email: "",
  phone_number: "",
  address: "",
  donation_type: "Money",
  amount: "",
  item_name: "",
  quantity: "",
  unit: "",
  purpose: "",
  donation_description: "",
  preferred_date: "",
  preferred_time: "",
  notes: "",
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Unable to read the selected screenshot"
        )
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function Donate() {
  const [form, setForm] = useState(initial);

  const [selectedBank, setSelectedBank] = useState(
    bankAccounts[0]?.id || ""
  );

  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState("");

  const [copied, setCopied] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const money =
    form.donation_type === "Money";

  const selectedAccount = useMemo(() => {
    return (
      bankAccounts.find(
        (account) =>
          account.id === selectedBank
      ) || bankAccounts[0]
    );
  }, [selectedBank]);

  const previewUrl = useMemo(() => {
    if (!receipt) {
      return "";
    }

    return URL.createObjectURL(receipt);
  }, [receipt]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(event) {
    const { name, type, checked, value } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function chooseReceipt(file) {
    setReceiptError("");

    if (!file) {
      setReceipt(null);
      return;
    }

    if (
      !RECEIPT_TYPES.includes(
        file.type
      )
    ) {
      setReceipt(null);

      setReceiptError(
        "Please choose a JPG, PNG or WEBP screenshot."
      );

      return;
    }

    if (file.size > MAX_RECEIPT_BYTES) {
      setReceipt(null);

      setReceiptError(
        "The screenshot must be 5 MB or smaller."
      );

      return;
    }

    setReceipt(file);
  }

  async function copyAccount(account) {
    try {
      await navigator.clipboard.writeText(
        account.accountNumber
      );

      setCopied(account.id);

      setTimeout(() => {
        setCopied("");
      }, 1400);
    } catch {
      setCopied("");
    }
  }

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setMsg("");
    setReceiptError("");

    try {
      let paymentScreenshot = null;

      if (money) {
        if (!selectedAccount) {
          throw new Error(
            "Please select a bank account"
          );
        }

        if (!receipt) {
          throw new Error(
            "Please upload your bank transfer screenshot"
          );
        }

        const data =
          await fileToDataUrl(receipt);

        const uploaded = await api(
          "/uploads/donation-proof",
          {
            method: "POST",

            body: JSON.stringify({
              file_name: receipt.name,
              mime_type: receipt.type,
              data,
            }),
          }
        );

        paymentScreenshot =
          uploaded.path;
      }

      const bankNote =
        money && selectedAccount
          ? `Bank transfer account: ${selectedAccount.bank}`
          : "";

      const body = {
        ...form,

        amount:
          form.amount !== ""
            ? Number(form.amount)
            : null,

        quantity:
          form.quantity !== ""
            ? Number(form.quantity)
            : null,

        payment_screenshot:
          paymentScreenshot,

        notes:
          [
            bankNote,
            form.notes,
          ]
            .filter(Boolean)
            .join(" | ") || null,
      };

      await api("/donations/submit", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setMsg(
        money
          ? "Thank you. Your donation and payment screenshot were submitted for verification."
          : "Thank you. Your donation information was submitted successfully."
      );

      setForm(initial);
      setReceipt(null);

      setSelectedBank(
        bankAccounts[0]?.id || ""
      );

      const input =
        document.getElementById(
          "donation-receipt"
        );

      if (input) {
        input.value = "";
      }
    } catch (error) {
      setMsg(
        error.message ||
          "Unable to submit donation."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <section className="page-hero shell">
        <PageHeader
          eyebrow="DONATE"
          title="Give with purpose. We track every resource."
          description="For monetary donations, choose an Ishraq bank account, make your transfer and upload the payment screenshot so staff can verify it."
        />
      </section>

      <section className="section shell narrow donation-page-section">
        {money && (
          <div className="bank-panel">
            <div className="bank-panel-head">
              <div className="bank-panel-icon">
                <Landmark size={22} />
              </div>

              <div>
                <span className="eyebrow">
                  BANK TRANSFER
                </span>

                <h2>
                  Choose an Ishraq bank account
                </h2>

                <p>
                  Transfer your donation using one
                  of the accounts below, then
                  attach the transaction screenshot
                  before submitting.
                </p>
              </div>
            </div>

            <div className="bank-account-grid">
              {bankAccounts.map(
                (account) => {
                  const active =
                    selectedBank ===
                    account.id;

                  return (
                    <button
                      type="button"
                      className={`bank-account-card ${
                        active
                          ? "bank-account-active"
                          : ""
                      }`}
                      key={account.id}
                      onClick={() =>
                        setSelectedBank(
                          account.id
                        )
                      }
                    >
                      <div className="bank-account-top">
                        <span className="bank-radio">
                          {active && (
                            <Check
                              size={13}
                            />
                          )}
                        </span>

                        <strong>
                          {account.bank}
                        </strong>
                      </div>

                      <span className="bank-label">
                        Account name
                      </span>

                      <b>
                        {
                          account.accountName
                        }
                      </b>

                      <span className="bank-label">
                        Account number
                      </span>

                      <div className="bank-number-row">
                        <code>
                          {
                            account.accountNumber
                          }
                        </code>

                        <span
                          className="copy-account-btn"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            copyAccount(
                              account
                            );
                          }}
                          title="Copy account number"
                        >
                          {copied ===
                          account.id ? (
                            <Check
                              size={15}
                            />
                          ) : (
                            <Copy
                              size={15}
                            />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        <form
          className="form-card donation-form-card"
          onSubmit={submit}
        >
          <div className="form-section-heading">
            <span className="eyebrow">
              DONATION DETAILS
            </span>

            <h2>
              {money
                ? "Submit your transfer for verification"
                : "Tell us about your donation"}
            </h2>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              name="is_anonymous"
              checked={
                form.is_anonymous
              }
              onChange={handleChange}
            />

            Donate anonymously
          </label>

          {!form.is_anonymous && (
            <div className="form-grid">
              <label>
                Full name

                <input
                  name="full_name"
                  value={
                    form.full_name
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Phone

                <input
                  name="phone_number"
                  value={
                    form.phone_number
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label>
                Address

                <input
                  name="address"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>
            </div>
          )}

          <div className="form-grid">
            <label>
              Donation type

              <select
                name="donation_type"
                value={
                  form.donation_type
                }
                onChange={
                  handleChange
                }
              >
                {[
                  "Money",
                  "Food",
                  "Clothing",
                  "Textbooks",
                  "Other",
                ].map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </label>

            {money ? (
              <label>
                Amount (ETB)

                <input
                  type="number"
                  min="1"
                  name="amount"
                  value={
                    form.amount
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>
            ) : (
              <>
                <label>
                  Item name

                  <input
                    name="item_name"
                    value={
                      form.item_name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </label>

                <label>
                  Quantity

                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={
                      form.quantity
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </label>

                <label>
                  Unit

                  <input
                    name="unit"
                    value={
                      form.unit
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="kg, boxes, pieces..."
                  />
                </label>
              </>
            )}

            <label>
              Purpose

              <input
                name="purpose"
                value={
                  form.purpose
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Food assistance"
              />
            </label>

            <label>
              Preferred date

              <input
                type="date"
                name="preferred_date"
                value={
                  form.preferred_date
                }
                onChange={
                  handleChange
                }
              />
            </label>
          </div>

          {money && (
            <div className="receipt-upload-block">
              <div className="receipt-title-row">
                <div>
                  <span className="eyebrow">
                    PAYMENT PROOF
                  </span>

                  <h3>
                    Upload transfer
                    screenshot{" "}
                    <span>*</span>
                  </h3>
                </div>

                {receipt && (
                  <button
                    type="button"
                    className="btn btn-danger btn-xs"
                    onClick={() =>
                      setReceipt(null)
                    }
                  >
                    <Trash2
                      size={13}
                    />
                    Remove
                  </button>
                )}
              </div>

              {!receipt ? (
                <label
                  htmlFor="donation-receipt"
                  className="receipt-upload-label"
                >
                  <UploadCloud
                    size={30}
                  />

                  <strong>
                    Click to choose your
                    bank transfer
                    screenshot
                  </strong>

                  <span>
                    JPG, PNG or WEBP ·
                    maximum 5 MB
                  </span>

                  <input
                    id="donation-receipt"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(
                      event
                    ) =>
                      chooseReceipt(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                    required
                  />
                </label>
              ) : (
                <div className="receipt-preview">
                  <img
                    src={previewUrl}
                    alt="Selected transfer screenshot preview"
                  />

                  <div>
                    <FileImage
                      size={19}
                    />

                    <span>
                      <strong>
                        {receipt.name}
                      </strong>

                      <small>
                        {(
                          receipt.size /
                          1024 /
                          1024
                        ).toFixed(
                          2
                        )}{" "}
                        MB · ready
                        to upload
                      </small>
                    </span>
                  </div>
                </div>
              )}

              {receiptError && (
                <div className="alert alert-error">
                  {receiptError}
                </div>
              )}
            </div>
          )}

          <label>
            Description

            <textarea
              rows="4"
              name="donation_description"
              value={
                form.donation_description
              }
              onChange={handleChange}
            />
          </label>

          <label>
            Additional note

            <textarea
              rows="3"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </label>

          {msg && (
            <div className="alert">
              {msg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gold"
            disabled={busy}
          >
            {busy
              ? "Submitting..."
              : money
                ? "Submit Donation & Screenshot"
                : "Submit Donation Information"}
          </button>
        </form>
      </section>
    </main>
  );
}

