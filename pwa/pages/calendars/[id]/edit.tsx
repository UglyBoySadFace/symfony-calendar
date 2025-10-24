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

import { Form } from "../../../components/calendar/Form";
import { PagedCollection } from "../../../types/collection";
import { Calendar } from "../../../types/Calendar";
import { fetch, FetchResponse, getItemPaths } from "../../../utils/dataAccess";

const getCalendar = async (id: string | string[] | undefined) =>
  id ? await fetch<Calendar>(`/calendars/${id}`) : Promise.resolve(undefined);

const Page: NextComponentType<NextPageContext> = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { data: calendar } = {} } = useQuery<
    FetchResponse<Calendar> | undefined
  >(["calendar", id], () => getCalendar(id));

  if (!calendar) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div>
      <div>
        <Head>
          <title>{calendar && `Edit Calendar ${calendar["@id"]}`}</title>
        </Head>
      </div>
      <Form calendar={calendar} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { id } = {},
}) => {
  if (!id) throw new Error("id not in query param");
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["calendar", id], () => getCalendar(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<Calendar>>("/calendars");
  const paths = await getItemPaths(
    response,
    "calendars",
    "/calendars/[id]/edit"
  );

  return {
    paths,
    fallback: true,
  };
};

export default Page;
