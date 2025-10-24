import {
  GetStaticPaths,
  GetStaticProps,
  NextComponentType,
  NextPageContext,
} from "next";
import DefaultErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "react-query";

import { Form } from "../../../components/event/Form";
import { PagedCollection } from "../../../types/collection";
import { Event } from "../../../types/Event";
import { fetch, FetchResponse, getItemPaths } from "../../../utils/dataAccess";

const getEvent = async (id: string | string[] | undefined) =>
  id ? await fetch<Event>(`/events/${id}`) : Promise.resolve(undefined);

const Page: NextComponentType<NextPageContext> = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { data: event } = {} } = useQuery<
    FetchResponse<Event> | undefined
  >(["event", id], () => getEvent(id));

  if (!event) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div>
      <div>
        <Head>
          <title>{event && `Edit Event ${event["@id"]}`}</title>
        </Head>
      </div>
      <Form event={event} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { id } = {},
}) => {
  if (!id) throw new Error("id not in query param");
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["event", id], () => getEvent(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<Event>>("/events");
  const paths = await getItemPaths(response, "events", "/events/[id]/edit");

  return {
    paths,
    fallback: true,
  };
};

export default Page;
