import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage, Field, FieldArray, Formik } from "formik";
import { useMutation } from "react-query";

import { fetch, FetchError, FetchResponse } from "../../utils/dataAccess";
import { Calendar } from "../../types/Calendar";

interface Props {
  calendar?: Calendar;
}

interface SaveParams {
  values: Calendar;
}

interface DeleteParams {
  id: string;
}

const saveCalendar = async ({ values }: SaveParams) =>
  await fetch<Calendar>(!values["@id"] ? "/calendars" : values["@id"], {
    method: !values["@id"] ? "POST" : "PUT",
    body: JSON.stringify(values),
  });

const deleteCalendar = async (id: string) =>
  await fetch<Calendar>(id, { method: "DELETE" });

export const Form: FunctionComponent<Props> = ({ calendar }) => {
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveMutation = useMutation<
    FetchResponse<Calendar> | undefined,
    Error | FetchError,
    SaveParams
  >((saveParams) => saveCalendar(saveParams));

  const deleteMutation = useMutation<
    FetchResponse<Calendar> | undefined,
    Error | FetchError,
    DeleteParams
  >(({ id }) => deleteCalendar(id), {
    onSuccess: () => {
      router.push("/calendars");
    },
    onError: (error) => {
      setError(`Error when deleting the resource: ${error}`);
      console.error(error);
    },
  });

  const handleDelete = () => {
    if (!calendar || !calendar["@id"]) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    deleteMutation.mutate({ id: calendar["@id"] });
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl mt-4">
      <Link
        href="/calendars"
        className="text-sm text-cyan-500 font-bold hover:text-cyan-700"
      >
        {`< Back to list`}
      </Link>
      <h1 className="text-3xl my-2">
        {calendar ? `Edit Calendar ${calendar["@id"]}` : `Create Calendar`}
      </h1>
      <Formik
        initialValues={
          calendar
            ? {
                ...calendar,
              }
            : new Calendar()
        }
        validate={() => {
          const errors = {};
          // add your validation logic here
          return errors;
        }}
        onSubmit={(values, { setSubmitting, setStatus, setErrors }) => {
          const isCreation = !values["@id"];
          saveMutation.mutate(
            { values },
            {
              onSuccess: () => {
                setStatus({
                  isValid: true,
                  msg: `Element ${isCreation ? "created" : "updated"}.`,
                });
                router.push("/calendars");
              },
              onError: (error) => {
                setStatus({
                  isValid: false,
                  msg: `${error.message}`,
                });
                if ("fields" in error) {
                  setErrors(error.fields);
                }
              },
              onSettled: () => {
                setSubmitting(false);
              },
            }
          );
        }}
      >
        {({
          values,
          status,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form className="shadow-md p-4" onSubmit={handleSubmit}>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_title"
              >
                title
              </label>
              <input
                name="title"
                id="calendar_title"
                value={values.title ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.title && touched.title ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.title && touched.title ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="title"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_color"
              >
                color
              </label>
              <input
                name="color"
                id="calendar_color"
                value={values.color ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.color && touched.color ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.color && touched.color ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="color"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_timezone"
              >
                timezone
              </label>
              <input
                name="timezone"
                id="calendar_timezone"
                value={values.timezone ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.timezone && touched.timezone ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.timezone && touched.timezone ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="timezone"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_description"
              >
                description
              </label>
              <input
                name="description"
                id="calendar_description"
                value={values.description ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.description && touched.description
                    ? "border-red-500"
                    : ""
                }`}
                aria-invalid={
                  errors.description && touched.description ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="description"
              />
            </div>
            <div className="mb-2">
              <div className="text-gray-700 block text-sm font-bold">
                members
              </div>
              <FieldArray
                name="members"
                render={(arrayHelpers) => (
                  <div className="mb-2" id="calendar_members">
                    {values.members && values.members.length > 0 ? (
                      values.members.map((item: any, index: number) => (
                        <div key={index}>
                          <Field name={`members.${index}`} />
                          <button
                            type="button"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => arrayHelpers.insert(index, "")}
                          >
                            +
                          </button>
                        </div>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => arrayHelpers.push("")}
                      >
                        Add
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_slug"
              >
                slug
              </label>
              <input
                name="slug"
                id="calendar_slug"
                value={values.slug ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.slug && touched.slug ? "border-red-500" : ""
                }`}
                aria-invalid={errors.slug && touched.slug ? "true" : undefined}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="slug"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_owner"
              >
                owner
              </label>
              <input
                name="owner"
                id="calendar_owner"
                value={values.owner ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.owner && touched.owner ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.owner && touched.owner ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="owner"
              />
            </div>
            <div className="mb-2">
              <div className="text-gray-700 block text-sm font-bold">
                events
              </div>
              <FieldArray
                name="events"
                render={(arrayHelpers) => (
                  <div className="mb-2" id="calendar_events">
                    {values.events && values.events.length > 0 ? (
                      values.events.map((item: any, index: number) => (
                        <div key={index}>
                          <Field name={`events.${index}`} />
                          <button
                            type="button"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => arrayHelpers.insert(index, "")}
                          >
                            +
                          </button>
                        </div>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => arrayHelpers.push("")}
                      >
                        Add
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_createdAt"
              >
                createdAt
              </label>
              <input
                name="createdAt"
                id="calendar_createdAt"
                value={values.createdAt?.toLocaleString() ?? ""}
                type="dateTime"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.createdAt && touched.createdAt ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.createdAt && touched.createdAt ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="createdAt"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="calendar_updatedAt"
              >
                updatedAt
              </label>
              <input
                name="updatedAt"
                id="calendar_updatedAt"
                value={values.updatedAt?.toLocaleString() ?? ""}
                type="dateTime"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.updatedAt && touched.updatedAt ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.updatedAt && touched.updatedAt ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="updatedAt"
              />
            </div>
            {status && status.msg && (
              <div
                className={`border px-4 py-3 my-4 rounded ${
                  status.isValid
                    ? "text-cyan-700 border-cyan-500 bg-cyan-200/50"
                    : "text-red-700 border-red-400 bg-red-100"
                }`}
                role="alert"
              >
                {status.msg}
              </div>
            )}
            <button
              type="submit"
              className="inline-block mt-2 bg-cyan-500 hover:bg-cyan-700 text-sm text-white font-bold py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              Submit
            </button>
          </form>
        )}
      </Formik>
      <div className="flex space-x-2 mt-4 justify-end">
        {calendar && (
          <button
            className="inline-block mt-2 border-2 border-red-400 hover:border-red-700 hover:text-red-700 text-sm text-red-400 font-bold py-2 px-4 rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
