import { CommonActions } from '@react-navigation/native';

/**
 * Return an action that navigates to the specified item's screen.
 *
 * To be used with the .navigate method of a navigation prop
 * or NavigationService.
 *
 * @param {object} navigation nav object from navigator
 * @param {object} item object with 'type' and 'id' keys:
 *   type: one of ['podcastEpisode', 'meditation', or 'liturgyItem']
 *   id: Contentful ID (sys.id) of the entry
 * @returns {object} navigation action
 */
export function openItem(item, { fromList } = {}) {
  const categoryScreens = {
    podcastEpisode: 'Podcasts',
    meditation: 'Meditations',
    liturgyItem: 'Liturgies',
  };
  const collectionScreens = {
    podcastEpisode: 'Podcast',
    meditation: 'MeditationsCategory',
    liturgyItem: 'Liturgy',
  };
  const collectionTypes = {
    podcastEpisode: 'podcast',
    meditation: 'meditationCategory',
    liturgyItem: 'liturgy',
  };
  const getCollectionRouteParam = {
    podcastEpisode: episode => ({ podcast: episode.podcast }),
    meditation: meditation => ({ category: meditation.category }),
    liturgyItem: liturgyItem => ({ liturgy: liturgyItem.liturgy }),
  };
  const instanceScreens = {
    podcastEpisode: 'SinglePodcastEpisode',
    meditation: 'SingleMeditation',
    liturgyItem: 'SingleLiturgyItem',
  };
  const routeParamNames = {
    podcastEpisode: 'episode',
    meditation: 'meditation',
    liturgyItem: 'liturgyItem',
  };
  const instanceParams = {
    [routeParamNames[item.type]]: {
      ...item,
      type: item.type,
    },
  };
  if (fromList) {
    return CommonActions.navigate({
      name: instanceScreens[item.type],
      params: instanceParams,
    });
  }

  const categoryScreen = categoryScreens[item.type];
  const tabScreen = `${categoryScreen}Tab`;

  const collectionParams = getCollectionRouteParam[item.type](item);
  const collectionType = collectionTypes[item.type];
  collectionParams[collectionType].type = collectionType;

  return CommonActions.reset({
    routes: [
      {
        name: tabScreen,
        state: {
          routes: [
            { name: categoryScreen },
            {
              name: collectionScreens[item.type],
              params: collectionParams,
            },
            {
              name: instanceScreens[item.type],
              params: instanceParams,
            },
          ],
        },
      },
    ],
  });
}
