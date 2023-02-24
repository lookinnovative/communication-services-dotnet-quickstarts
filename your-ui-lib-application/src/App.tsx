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
  FluentThemeProvider, 
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
import { initializeIcons, registerIcons, Stack } from '@fluentui/react';
import { CallingComponents } from './CallingComponents';
import { ChatComponents } from './ChatComponents';
import { VideoGallery } from '@azure/communication-react';
import { DEFAULT_COMPONENT_ICONS } from '@azure/communication-react';
import { VideoTile } from '@azure/communication-react';
import { GridLayout, } from '@azure/communication-react';
import { ControlBar } from '@azure/communication-react';
import { DefaultButton } from '@fluentui/react';
import { ControlBarButton } from '@azure/communication-react';
import { DevicesButton } from '@azure/communication-react';
import { EndCallButton } from '@azure/communication-react';
import { MicrophoneButton } from '@azure/communication-react';
import { ParticipantsButton } from '@azure/communication-react';
import {  CallParticipantListParticipant, } from '@azure/communication-react';
import { IContextualMenuProps } from '@fluentui/react';
import { CameraButton } from '@azure/communication-react';
import { ScreenShareButton } from '@azure/communication-react';
import { Airplane20Filled, VehicleShip20Filled } from '@fluentui/react-icons';
import { MessageThread } from '@azure/communication-react';
import { GetHistoryChatMessages } from './placeholdermessages';

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

const MockLocalParticipant = {
  userId: 'user1',
  displayName: 'You',
  state: 'Connected',
  isMuted: true
};

const MockRemoteParticipants = [
  {
    userId: 'user2',
    displayName: 'Peter Parker'
  },
  {
    userId: 'user3',
    displayName: 'Thor'
  },
  {
    userId: 'user4',
    displayName: 'Matthew Murdock'
  },
  {
    userId: 'user5',
    displayName: 'Bruce Wayne'
  }
];

// This must be the only named export from this module, and must be named to match the storybook path suffix.
// This ensures that storybook hoists the story instead of creating a folder with a single entry.
export const FloatingLocalVideoExample: () => JSX.Element = () => {
  const containerStyle = { height: '50vh' };
  return (
    <Stack style={containerStyle}>
      <VideoGallery
        layout="floatingLocalVideo"
        localParticipant={MockLocalParticipant}
        remoteParticipants={MockRemoteParticipants}
      />
    </Stack>
  );
};

export const VideoTileExample: () => JSX.Element = () => {
  const videoTileStyles = { root: { height: '300px', width: '400px', border: '1px solid #999' } };

  return (
    <FluentThemeProvider>
      <VideoTile
        styles={videoTileStyles}
        displayName={'Maximus Aurelius'}
        showMuteIndicator={true}
        isMuted={true}
        renderElement={null}
        isMirrored={true}
      />
    </FluentThemeProvider>
  );
};

export const GridLayoutExample = (): JSX.Element => {
  const videoTileStyles = { root: { padding: '10px', border: '1px solid #999' } };
  return (
    <div style={{ height: '530px', width: '830px' }}>
      <GridLayout>
        <VideoTile styles={videoTileStyles} displayName={'Michael'} />
        <VideoTile styles={videoTileStyles} displayName={'Jim'} />
        <VideoTile styles={videoTileStyles} displayName={'Pam'} />
        <VideoTile styles={videoTileStyles} displayName={'Dwight'} />
      </GridLayout>
    </div>
  );
};

const mockParticipants: CallParticipantListParticipant[] = [
  {
    userId: 'user1',
    displayName: 'You',
    state: 'Connected',
    isMuted: true,
    isScreenSharing: false,
    isRemovable: true
  },
  {
    userId: 'user2',
    displayName: 'Hal Jordan',
    state: 'Connected',
    isMuted: true,
    isScreenSharing: true,
    isRemovable: true
  },
  {
    userId: 'user3',
    displayName: 'Barry Allen',
    state: 'Idle',
    isMuted: false,
    isScreenSharing: false,
    isRemovable: true
  },
  {
    userId: 'user4',
    displayName: 'Bruce Wayne',
    state: 'Connecting',
    isMuted: false,
    isScreenSharing: false,
    isRemovable: false
  }
];

export const AllButtonsControlBarExample: () => JSX.Element = () => {
  const exampleOptionsMenuProps: IContextualMenuProps = {
    items: [
      {
        key: '1',
        name: 'Choose Camera',
        iconProps: { iconName: 'LocationCircle' },
        onClick: () => alert('Choose Camera Menu Item Clicked!')
      }
    ]
  };
  const onMuteAll = (): void => {
    // your implementation to mute all participants
  };

  return (
    <FluentThemeProvider>
      <ControlBar layout={'horizontal'}>
        <CameraButton
          onClick={() => {
            /*handle onClick*/
          }}
        />
        <MicrophoneButton
          onClick={() => {
            /*handle onClick*/
          }}
        />
        <ScreenShareButton
          onClick={() => {
            /*handle onClick*/
          }}
        />
        <ParticipantsButton
          participants={mockParticipants}
          myUserId={'user1'}
          callInvitationURL={'URL to copy'}
          onMuteAll={onMuteAll}
        />
        <DevicesButton menuProps={exampleOptionsMenuProps} />
        <EndCallButton
          onClick={() => {
            /*handle onClick*/
          }}
        />
      </ControlBar>
    </FluentThemeProvider>
  );
};

export const ControlBarButtonWithLabelExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <ControlBarButton
        key={'btn1'}
        onRenderIcon={() => <Airplane20Filled key={'airplaneIconKey'} primaryFill="currentColor" />}
        strings={{ label: 'airplane' }}
        labelKey={'airplaneButtonLabel'}
        showLabel={true}
      />
      <ControlBarButton
        key={'btn1'}
        onRenderIcon={() => <VehicleShip20Filled key={'shipIconKey'} primaryFill="currentColor" />}
        strings={{ label: 'ship' }}
        labelKey={'shipButtonLabel'}
        showLabel={true}
      />
    </FluentThemeProvider>
  );
};

const exampleOptionsMenuProps: IContextualMenuProps = {
  items: [
    {
      key: '1',
      name: 'Choose Camera',
      iconProps: { iconName: 'LocationCircle' },
      onClick: () => alert('Choose Camera Menu Item Clicked!')
    }
  ]
};

export const DevicesButtonWithLabelExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <DevicesButton showLabel={true} menuProps={exampleOptionsMenuProps} />
    </FluentThemeProvider>
  );
};

export const EndCallButtonWithLabelExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <EndCallButton showLabel={true} />
    </FluentThemeProvider>
  );
};

export const MicrophoneButtonWithLabelExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <MicrophoneButton showLabel={true} checked={true} />
    </FluentThemeProvider>
  );
};

export const ParticipantsButtonWithLabelExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <ParticipantsButton showLabel={true} participants={mockParticipants} />
    </FluentThemeProvider>
  );
};

export const ScreenShareButtonWithLabelExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <ScreenShareButton showLabel={true} checked={true} />
    </FluentThemeProvider>
  );
};

export const DefaultMessageThreadExample: () => JSX.Element = () => {
  return (
    <FluentThemeProvider>
      <MessageThread userId={'1'} messages={GetHistoryChatMessages()} />
    </FluentThemeProvider>
  );
};



/**
 * Entry point of your application.
 */

function App(): JSX.Element {
  // If you don't want to provide custom icons, you can register the default ones included with the library.
  // This will ensure that all the icons are rendered correctly.
  initializeIcons();
  registerIcons({ icons: DEFAULT_COMPONENT_ICONS });

  function CompletedComponentsApp(): JSX.Element {
    const stackStyle = {
      root: {
        width: '100%'
      }
    };
  
    initializeIcons();
    registerIcons({ icons: DEFAULT_COMPONENT_ICONS });
  
    return (
      <FluentThemeProvider>
        <Stack horizontal horizontalAlign="space-evenly" styles={stackStyle}>
          <CallingComponents />
          <ChatComponents />
        </Stack>
      </FluentThemeProvider>
    );
  }
  

  
  
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