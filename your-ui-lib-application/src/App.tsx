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
import { GridLayout } from '@azure/communication-react';
import { darkTheme } from '@azure/communication-react';
import { ControlBar } from '@azure/communication-react';
import { ControlBarButton } from '@azure/communication-react';
import { DevicesButton } from '@azure/communication-react';
import { EndCallButton } from '@azure/communication-react';
import { MicrophoneButton } from '@azure/communication-react';
import { ParticipantsButton } from '@azure/communication-react';
import { CallParticipantListParticipant, } from '@azure/communication-react';
import { IContextualMenuProps } from '@fluentui/react';
import { CameraButton } from '@azure/communication-react';
import { ScreenShareButton } from '@azure/communication-react';
import { Airplane20Filled, VehicleShip20Filled } from '@fluentui/react-icons';
import { MessageThread } from '@azure/communication-react';
import { GetHistoryChatMessages } from './placeholdermessages';
import { GroupCallLocator } from '@azure/communication-calling';
import { ChatParticipant } from '@azure/communication-chat';
import { v1 as createGUID } from 'uuid';
import { TeamsMeetingLinkLocator } from '@azure/communication-calling';
import { ParticipantItem, ParticipantItemProps } from '@azure/communication-react';
import { PersonaPresence } from '@fluentui/react';
import { Persona, PersonaSize } from '@fluentui/react';

import {
  CallAndChatLocator,
  CallWithChatComposite,
  useAzureCommunicationCallWithChatAdapter,
  CallWithChatCompositeOptions
} from '@azure/communication-react';
import { Theme, PartialTheme, Spinner } from '@fluentui/react';
import {
  CallAdapterLocator,
  CallCompositeOptions,
  CompositeLocale,
  } from '@azure/communication-react';
import { validate as validateUUID } from 'uuid';
import {
  AvatarPersonaData,
  CallAdapter,
  ParticipantMenuItemsCallback,
  } from '@azure/communication-react';
  import { IContextualMenuItem, } from '@fluentui/react';
import { MessageStatus, MessageStatusIndicator } from '@azure/communication-react';

 

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
const USER_ID = '8:acs:529c7b72-7c34-4ddb-9e78-1318bebc1e4d_00000017-2915-0727-bc66-563a0d005ef2';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNiIsIng1dCI6Im9QMWFxQnlfR3hZU3pSaXhuQ25zdE5PU2p2cyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOjUyOWM3YjcyLTdjMzQtNGRkYi05ZTc4LTEzMThiZWJjMWU0ZF8wMDAwMDAxNy0yOTE1LTA3MjctYmM2Ni01NjNhMGQwMDVlZjIiLCJzY3AiOjE3OTIsImNzaSI6IjE2NzczMzkwOTEiLCJleHAiOjE2Nzc0MjU0OTEsInJnbiI6ImFtZXIiLCJhY3NTY29wZSI6ImNoYXQsdm9pcCIsInJlc291cmNlSWQiOiI1MjljN2I3Mi03YzM0LTRkZGItOWU3OC0xMzE4YmViYzFlNGQiLCJyZXNvdXJjZUxvY2F0aW9uIjoidW5pdGVkc3RhdGVzIiwiaWF0IjoxNjc3MzM5MDkxfQ.A3FqCYHBCategk2RJSsVnwWd1UYJx9GoHzSL0NUvEUNr6mvfOZRNJvWyW2c-MKeMlQKg03iq1_TMcR-YYzjdSGbaXxETVlwX-uILh3yTGKWyRQxlvGf8fHcdVK05cOjtIVXiTMM1sih7rFRLE_sOG3CrJWzq7kjhGvx1CkzO3k_9hL_r2aR2cXXXS-J_-YOaCIntFMt82HjI0Nu8_sPRKnkmGh_FzWYkEooXo1Zo36F2tDAtr5yQ9wvQaenWggko7Omz7-OI_qGZKgtp1ZXtiTOEdk00i_N33LgbpBWZW0z1tBrQ7Jj-WztssQRDmryHJabsLTlS-ri79po9WkYuAQ';

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

const isTeamsMeetingLink = (link: string): boolean => link.startsWith('https://teams.microsoft.com/l/meetup-join');
const isGroupID = (id: string): boolean => validateUUID(id);
const isRoomID = (id: string): boolean => {
  const num = Number(id);

  if (Number.isInteger(num) && num > 0) {
    return true;
  }

  return false;
};



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

const createNewChatThread = async (chatClient: ChatClient, participants: ChatParticipant[]): Promise<string> => {
  const chatThreadResponse = await chatClient.createChatThread(
    { topic: 'Meeting with a friendly bot' },
    { participants }
  );
  if (chatThreadResponse.invalidParticipants && chatThreadResponse.invalidParticipants.length > 0) {
    throw 'Server could not add participants to the chat thread';
  }

  const chatThread = chatThreadResponse.chatThread;
  if (!chatThread || !chatThread.id) {
    throw 'Server could not create chat thread';
  }

  return chatThread.id;
};

export const createCallWithChat = async (
  token: string,
  userId: string,
  endpointUrl: string,
  displayName: string
): Promise<{ callLocator: GroupCallLocator; chatThreadId: string }> => {
  const locator = { groupId: createGUID() };
  const chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(token));
  const threadId = await createNewChatThread(chatClient, [
    { id: { communicationUserId: userId }, displayName: displayName }
  ]);

  return {
    callLocator: locator,
    chatThreadId: threadId
  };
};

export type CallWithChatExampleProps = {
  // Props needed for the construction of the CallWithChatAdapter
  userId: CommunicationUserIdentifier;
  token: string;
  displayName: string;
  endpointUrl: string;
  /**
   * For CallWithChat you need to provide either a teams meeting locator or a CallAndChat locator
   * for the composite
   *
   * CallAndChatLocator: This locator is comprised of a groupId call locator and a chat thread
   * threadId for the session. See documentation on the {@link CallAndChatLocator} to see types of calls supported.
   * {callLocator: ..., threadId: ...}
   *
   * TeamsMeetingLinkLocator: this is a special locator comprised of a Teams meeting link
   * {meetingLink: ...}
   */
  locator: TeamsMeetingLinkLocator | CallAndChatLocator;

  // Props to customize the CallWithChatComposite experience
  fluentTheme?: PartialTheme | Theme;
  compositeOptions?: CallWithChatCompositeOptions;
  callInvitationURL?: string;
  formFactor?: 'desktop' | 'mobile';
};

export const CallWithChatExperience = (props: CallWithChatExampleProps): JSX.Element => {
  // Construct a credential for the user with the token retrieved from your server. This credential
  // must be memoized to ensure useAzureCommunicationCallWithChatAdapter is not retriggered on every render pass.
  const credential = useMemo(() => new AzureCommunicationTokenCredential(props.token), [props.token]);

  // Create the adapter using a custom react hook provided in the @azure/communication-react package.
  // See https://aka.ms/acsstorybook?path=/docs/composite-adapters--page for more information on adapter construction and alternative constructors.
  const adapter = useAzureCommunicationCallWithChatAdapter({
    userId: props.userId,
    displayName: props.displayName,
    credential,
    locator: props.locator,
    endpoint: props.endpointUrl
  });

  // The adapter is created asynchronously by the useAzureCommunicationCallWithChatAdapter hook.
  // Here we show a spinner until the adapter has finished constructing.
  if (!adapter) {
    return <Spinner label="Initializing..." />;
  }

  return (
    <CallWithChatComposite
      adapter={adapter}
      fluentTheme={props.fluentTheme}
      formFactor={props.formFactor}
      joinInvitationURL={props.callInvitationURL}
      options={props.compositeOptions}
    />
  );
};

export type ContainerProps = {
  userId: CommunicationUserIdentifier;
  token: string;
  locator: string;
  displayName: string;
  avatarInitials: string;
  callInvitationURL?: string;
  formFactor?: 'desktop' | 'mobile';
  fluentTheme?: PartialTheme | Theme;
  locale?: CompositeLocale;
  options?: CallCompositeOptions;
};

export const CustomDataModelExampleContainer = (props: ContainerProps): JSX.Element => {
  const credential = useMemo(() => new AzureCommunicationTokenCredential(props.token), [props.token]);
  const locator = useMemo(
    () => (isTeamsMeetingLink(props.locator) ? { meetingLink: props.locator } : { groupId: props.locator }),
    [props.locator]
  );
  const adapter = useAzureCommunicationCallAdapter(
    {
      userId: props.userId,
      displayName: props.displayName,
      credential,
      locator
    },
    undefined,
    async (adapter: CallAdapter): Promise<void> => {
      await adapter.leaveCall().catch((e) => {
        console.error('Failed to leave call', e);
      });
    }
  );

  // Data model injection: Contoso provides custom initials for the user avatar.
  //
  // Note: Call Composite doesn't implement a memoization mechanism for this callback.
  // It is recommended that Contoso memoize the `onFetchAvatarPersonaData` callback
  // to avoid costly re-fetching of data.
  // A 3rd Party utility such as Lodash (_.memoize) can be used to memoize the callback.
  const onFetchAvatarPersonaData = async (/* userId: string */): Promise<AvatarPersonaData> => ({
    text: props.avatarInitials ? props.avatarInitials : props.displayName
  });

  // Custom Menu Item Callback for Participant List
  const onFetchParticipantMenuItems: ParticipantMenuItemsCallback = (participantId, userId, defaultMenuItems) => {
    let customMenuItems: IContextualMenuItem[] = [
      {
        key: 'Custom Menu Item',
        text: 'Custom Menu Item',
        onClick: () => console.log('Custom Menu Item Clicked')
      }
    ];
    if (defaultMenuItems) {
      customMenuItems = customMenuItems.concat(defaultMenuItems);
    }
    return customMenuItems;
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {adapter && (
        <CallComposite
          fluentTheme={props.fluentTheme}
          adapter={adapter}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          onFetchParticipantMenuItems={onFetchParticipantMenuItems}
          callInvitationUrl={props?.callInvitationURL}
          locale={props?.locale}
          formFactor={props?.formFactor}
          options={props?.options}
        />
      )}
    </div>
  );
};

type CallAdapterExampleProps = {
  userId: CommunicationUserIdentifier;
  accessToken: string;
  callLocator: CallAdapterLocator;
  displayName: string;
};

export const CallAdapterExample = (props: CallAdapterExampleProps): JSX.Element => {
  const credential = useMemo(() => new AzureCommunicationTokenCredential(props.accessToken), [props.accessToken]);
  const adapter = useAzureCommunicationCallAdapter({
    userId: props.userId,
    displayName: props.displayName,
    credential,
    locator: props.callLocator
  });
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {adapter ? <CallComposite adapter={adapter} /> : <>Initializing</>}
    </div>
  );
};

type ChatAdapterExampleProps = {
  userId: CommunicationUserIdentifier;
  accessToken: string;
  endpointUrl: string;
  threadId: string;
  displayName: string;
};

export const ChatAdapterExample = (props: ChatAdapterExampleProps): JSX.Element => {
  const credential = useMemo(() => new AzureCommunicationTokenCredential(props.accessToken), [props.accessToken]);
  const adapter = useAzureCommunicationChatAdapter({
    endpoint: props.endpointUrl,
    userId: props.userId,
    displayName: props.displayName,
    credential,
    threadId: props.threadId
  });
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {adapter ? <ChatComposite adapter={adapter} /> : <>Initializing </>}
    </div>
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

export const DefaultMessageStatusIndicatorsExample: () => JSX.Element = () => {
  return (
    <Stack horizontalAlign="start">
      <MessageStatusIndicator status={'delivered' as MessageStatus} />
      <MessageStatusIndicator status={'seen' as MessageStatus} />
      <MessageStatusIndicator status={'sending' as MessageStatus} />
      <MessageStatusIndicator status={'failed' as MessageStatus} />
    </Stack>
  );
};

export const ParticipantItemExample: () => JSX.Element = () => {
  const menuItems: IContextualMenuItem[] = [
    {
      key: 'Mute',
      text: 'Mute',
      onClick: () => alert('Mute')
    },
    {
      key: 'Remove',
      text: 'Remove',
      onClick: () => alert('Remove')
    }
  ];

  return <ParticipantItem displayName="Johnny Bravo" menuItems={menuItems} presence={PersonaPresence.online} />;
};

export const DefaultThemeSnippet = (): JSX.Element => {
  return (
    <ControlBar>
      <CameraButton />
      <MicrophoneButton />
      <ScreenShareButton />
      <EndCallButton />
    </ControlBar>
  );
};

export const DarkControlBar = (): JSX.Element => {
  return (
    <FluentThemeProvider fluentTheme={darkTheme}>
      <ControlBar>
        <CameraButton />
        <MicrophoneButton />
        <ScreenShareButton />
        <DevicesButton />
        <EndCallButton />
      </ControlBar>
    </FluentThemeProvider>
  );
};

export const lightTheme = {
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralSecondaryAlt: '#8a8886',
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#201f1e',
    black: '#000000',
    white: '#ffffff',
  }
};



export default App;