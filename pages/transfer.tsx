import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const cookies = parseCookies(ctx);
  const accessToken = cookies['my-access-token'];
  const refreshToken = cookies['my-refresh-token'];

  return {
    props: {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    },
  };
};

export default function TransferPage({
  accessToken,
  refreshToken,
}: {
  accessToken: string | null;
  refreshToken: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    if (accessToken && refreshToken) {
      // Set the tokens as query parameters in the URL
      router.replace(
        `/my-notes?accessToken=${encodeURIComponent(
          accessToken,
        )}&refreshToken=${encodeURIComponent(refreshToken)}`,
      );
    }
  }, [accessToken, refreshToken, router]);

  return (
    <div>
      <h1>Transferring Authentication State...</h1>
    </div>
  );
}
