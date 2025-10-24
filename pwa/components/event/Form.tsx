import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage, Field, FieldArray, Formik } from "formik";
import { useMutation } from "react-query";

import { fetch, FetchError, FetchResponse } from "../../utils/dataAccess";
import { Event } from "../../types/Event";

interface Props {
  event?: Event;
}

interface SaveParams {
  values: Event;
}

interface DeleteParams {
  id: string;
}

const saveEvent = async ({ values }: SaveParams) =>
  await fetch<Event>(!values["@id"] ? "/events" : values["@id"], {
    method: !values["@id"] ? "POST" : "PUT",
    body: JSON.stringify(values),
  });

const deleteEvent = async (id: string) =>
  await fetch<Event>(id, { method: "DELETE" });

export const Form: FunctionComponent<Props> = ({ event }) => {
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveMutation = useMutation<
    FetchResponse<Event> | undefined,
    Error | FetchError,
    SaveParams
  >((saveParams) => saveEvent(saveParams));

  const deleteMutation = useMutation<
    FetchResponse<Event> | undefined,
    Error | FetchError,
    DeleteParams
  >(({ id }) => deleteEvent(id), {
    onSuccess: () => {
      router.push("/events");
    },
    onError: (error) => {
      setError(`Error when deleting the resource: ${error}`);
      console.error(error);
    },
  });

  const handleDelete = () => {
    if (!event || !event["@id"]) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    deleteMutation.mutate({ id: event["@id"] });
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl mt-4">
      <Link
        href="/events"
        className="text-sm text-cyan-500 font-bold hover:text-cyan-700"
      >
        {`< Back to list`}
      </Link>
      <h1 className="text-3xl my-2">
        {event ? `Edit Event ${event["@id"]}` : `Create Event`}
      </h1>
      <Formik
        initialValues={
          event
            ? {
                ...event,
              }
            : new Event()
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
                router.push("/events");
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
                htmlFor="event_calendar"
              >
                calendar
              </label>
              <input
                name="calendar"
                id="event_calendar"
                value={values.calendar ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.calendar && touched.calendar ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.calendar && touched.calendar ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="calendar"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_startsAt"
              >
                startsAt
              </label>
              <input
                name="startsAt"
                id="event_startsAt"
                value={values.startsAt?.toLocaleString() ?? ""}
                type="dateTime"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.startsAt && touched.startsAt ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.startsAt && touched.startsAt ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="startsAt"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_endsAt"
              >
                endsAt
              </label>
              <input
                name="endsAt"
                id="event_endsAt"
                value={values.endsAt?.toLocaleString() ?? ""}
                type="dateTime"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.endsAt && touched.endsAt ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.endsAt && touched.endsAt ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="endsAt"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_title"
              >
                title
              </label>
              <input
                name="title"
                id="event_title"
                value={values.title ?? ""}
                type="text"
                placeholder=""
                required={true}
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
                htmlFor="event_timezone"
              >
                timezone
              </label>
              <input
                name="timezone"
                id="event_timezone"
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
                htmlFor="event_allDay"
              >
                allDay
              </label>
              <input
                name="allDay"
                id="event_allDay"
                value={values.allDay ?? ""}
                type="checkbox"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.allDay && touched.allDay ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.allDay && touched.allDay ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="allDay"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_duration"
              >
                duration
              </label>
              <input
                name="duration"
                id="event_duration"
                value={values.duration ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.duration && touched.duration ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.duration && touched.duration ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="duration"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_rrule"
              >
                rrule
              </label>
              <input
                name="rrule"
                id="event_rrule"
                value={values.rrule ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.rrule && touched.rrule ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.rrule && touched.rrule ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="rrule"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_exRule"
              >
                exRule
              </label>
              <input
                name="exRule"
                id="event_exRule"
                value={values.exRule ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.exRule && touched.exRule ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.exRule && touched.exRule ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="exRule"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_exDates"
              >
                exDates
              </label>
              <input
                name="exDates"
                id="event_exDates"
                value={values.exDates ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.exDates && touched.exDates ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.exDates && touched.exDates ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="exDates"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_organizer"
              >
                organizer
              </label>
              <input
                name="organizer"
                id="event_organizer"
                value={values.organizer ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.organizer && touched.organizer ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.organizer && touched.organizer ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="organizer"
              />
            </div>
            <div className="mb-2">
              <div className="text-gray-700 block text-sm font-bold">
                attendees
              </div>
              <FieldArray
                name="attendees"
                render={(arrayHelpers) => (
                  <div className="mb-2" id="event_attendees">
                    {values.attendees && values.attendees.length > 0 ? (
                      values.attendees.map((item: any, index: number) => (
                        <div key={index}>
                          <Field name={`attendees.${index}`} />
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
                htmlFor="event_description"
              >
                description
              </label>
              <input
                name="description"
                id="event_description"
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
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_location"
              >
                location
              </label>
              <input
                name="location"
                id="event_location"
                value={values.location ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.location && touched.location ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.location && touched.location ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="location"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_latLng"
              >
                latLng
              </label>
              <input
                name="latLng"
                id="event_latLng"
                value={values.latLng ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.latLng && touched.latLng ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.latLng && touched.latLng ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="latLng"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_conferenceUrl"
              >
                conferenceUrl
              </label>
              <input
                name="conferenceUrl"
                id="event_conferenceUrl"
                value={values.conferenceUrl ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.conferenceUrl && touched.conferenceUrl
                    ? "border-red-500"
                    : ""
                }`}
                aria-invalid={
                  errors.conferenceUrl && touched.conferenceUrl
                    ? "true"
                    : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="conferenceUrl"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_status"
              >
                status
              </label>
              <input
                name="status"
                id="event_status"
                value={values.status ?? ""}
                type="text"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.status && touched.status ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.status && touched.status ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="status"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_private"
              >
                private
              </label>
              <input
                name="private"
                id="event_private"
                value={values.private ?? ""}
                type="checkbox"
                placeholder=""
                className={`mt-1 block w-full ${
                  errors.private && touched.private ? "border-red-500" : ""
                }`}
                aria-invalid={
                  errors.private && touched.private ? "true" : undefined
                }
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                className="text-xs text-red-500 pt-1"
                component="div"
                name="private"
              />
            </div>
            <div className="mb-2">
              <label
                className="text-gray-700 block text-sm font-bold"
                htmlFor="event_createdAt"
              >
                createdAt
              </label>
              <input
                name="createdAt"
                id="event_createdAt"
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
                htmlFor="event_updatedAt"
              >
                updatedAt
              </label>
              <input
                name="updatedAt"
                id="event_updatedAt"
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
        {event && (
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
