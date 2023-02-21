import {
  AzureCommunicationTokenCredential,
  CommunicationUserIdentifier,
} from '@azure/communication-common';
import {
  CallComposite,
  ChatComposite,
  fromFlatCommunicationIdentifier,
  useAzureCommunicationCallAdapter,
  useAzureCommunicationChatAdapter,
} from '@azure/communication-react';
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatClient } from '@azure/communication-chat';
import { initializeIcons } from '@fluentui/react';

/**
 * Authentication information needed for your client application to use
 * Azure Communication Services.
 *
 * For this quickstart, you can obtain these from the Azure portal as described here:
 * https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/identity/quick-create-identity
 *
 * In a real application, your backend service would provide these to the client
 * application after the user goes through your authentication flow.
 */
const ENDPOINT_URL = 'https://verizann-media.communication.azure.com';
const USER_ID = '8:acs:529c7b72-7c34-4ddb-9e78-1318bebc1e4d_00000017-15f4-2bd8-3ef0-8b3a0d00a5a1';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNiIsIng1dCI6Im9QMWFxQnlfR3hZU3pSaXhuQ25zdE5PU2p2cyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOjUyOWM3YjcyLTdjMzQtNGRkYi05ZTc4LTEzMThiZWJjMWU0ZF8wMDAwMDAxNy0xNWY0LTJiZDgtM2VmMC04YjNhMGQwMGE1YTEiLCJzY3AiOjE3OTIsImNzaSI6IjE2NzcwMTgxNzEiLCJleHAiOjE2NzcxMDQ1NzEsInJnbiI6ImFtZXIiLCJhY3NTY29wZSI6ImNoYXQsdm9pcCIsInJlc291cmNlSWQiOiI1MjljN2I3Mi03YzM0LTRkZGItOWU3OC0xMzE4YmViYzFlNGQiLCJyZXNvdXJjZUxvY2F0aW9uIjoidW5pdGVkc3RhdGVzIiwiaWF0IjoxNjc3MDE4MTcxfQ.oh1p70NOqpYAhyLVsmCXARCPOx2Y01c8MUbL2EQwZkEQGBcLicvtmj2zXceKrGjYvdRfk4wnKsYR96fxQctvgV6A-sMk-uOYjFs4Ulx04B3FNMhpalJ3GUQ0sGMWsbcDOUuaA96fWu3WzUU9WlPrk2IiDlVrK2UkxrSjLxzlAwqnRWxqryKijtGON5FIR_D1NxrUqvmYOeV64lPtLzA5KXNc_a9GasypZLFk54N-RalH-UtZExbuIxfos08xp9X4h4E4RgvLcWZqaHIxLjC9YfT2zszHr-U07cp4owoLIUiF6BNnbzHC3Zp_nH1yappGBqePnPtAzY4z71YJuRKZ5g';

/**
 * Display name for the local participant.
 * In a real application, this would be part of the user data that your
 * backend services provides to the client application after the user
 * goes through your authentication flow.
 */
const DISPLAY_NAME = '<Display Name>';

initializeIcons();

/**
 * Entry point of your application.
 */
function App(): JSX.Element {
  // Arguments that would usually be provided by your backend service or
  // (indirectly) by the user.
  const { endpointUrl, userId, token, displayName, groupId, threadId } =
    useAzureCommunicationServiceArgs();

  // A well-formed token is required to initialize the chat and calling adapters.
  const credential = useMemo(() => {
    try {
      return new AzureCommunicationTokenCredential(token);
    } catch {
      console.error('Failed to construct token credential');
      return undefined;
    }
  }, [token]);

  // Memoize arguments to `useAzureCommunicationCallAdapter` so that
  // a new adapter is only created when an argument changes.
  const callAdapterArgs = useMemo(
    () => ({
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential,
      locator: {
        groupId,
      },
    }),
    [userId, credential, displayName, groupId]
  );
  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

  // Memoize arguments to `useAzureCommunicationChatAdapter` so that
  // a new adapter is only created when an argument changes.
  const chatAdapterArgs = useMemo(
    () => ({
      endpoint: endpointUrl,
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential,
      threadId,
    }),
    [endpointUrl, userId, displayName, credential, threadId]
  );
  const chatAdapter = useAzureCommunicationChatAdapter(chatAdapterArgs);

  if (!!callAdapter && !!chatAdapter) {
    return (
      <div style={{ height: '100vh', display: 'flex' }}>
        <div style={containerStyle}>
          <ChatComposite adapter={chatAdapter} />
        </div>
        <div style={containerStyle}>
          <CallComposite adapter={callAdapter} />
        </div>
      </div>
    );
  }
  if (credential === undefined) {
    return (
      <h3>Failed to construct credential. Provided token is malformed.</h3>
    );
  }
  return <h3>Initializing...</h3>;
}

const containerStyle: CSSProperties = {
  border: 'solid 0.125rem olive',
  margin: '0.5rem',
  width: '50vw',
};
/**
 * This hook returns all the arguments required to use the Azure Communication services
 * that would be provided by your backend service after user authentication
 * depending on the user-flow (e.g. which chat thread to use).
 */
function useAzureCommunicationServiceArgs(): {
  endpointUrl: string;
  userId: string;
  token: string;
  displayName: string;
  groupId: string;
  threadId: string;
} {
  const [threadId, setThreadId] = useState('');
  // For the quickstart, create a new thread with just the local participant in it.
  useEffect(() => {
    (async () => {
      const client = new ChatClient(
        ENDPOINT_URL,
        new AzureCommunicationTokenCredential(TOKEN)
      );
      const { chatThread } = await client.createChatThread(
        {
          topic: 'Composites Quickstarts',
        },
        {
          participants: [
            {
              id: fromFlatCommunicationIdentifier(USER_ID),
              displayName: DISPLAY_NAME,
            },
          ],
        }
      );
      setThreadId(chatThread?.id ?? '');
    })();
  }, []);

  // For the quickstart, generate a random group ID.
  // The group Id must be a UUID.
  const groupId = useRef(uuidv4());

  return {
    endpointUrl: ENDPOINT_URL,
    userId: USER_ID,
    token: TOKEN,
    displayName: DISPLAY_NAME,
    groupId: groupId.current,
    threadId,
  };
}

export default App;