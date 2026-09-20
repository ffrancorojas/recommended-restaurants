import { ScreenLayout } from '@/components';
import { ScrollView } from 'react-native';
import { styles } from './newRestaurantScreen.styles';
import { useNewRestaurantScreen } from './useNewRestaurantScreen';
import { RestaurantForm } from './restaurant-form';

export const NewRestaurantScreen = () => {
  const {
    restaurantId,
    visitOnly,
    form,
    scroll,
    viewportHeight,
    legacyPrice,
    update,
    save,
    goBack,
    setViewportHeight,
    setContentHeight,
    setOpinionY,
  } = useNewRestaurantScreen();

  return (
    <ScreenLayout
      title={visitOnly ? 'Valorar visita' : restaurantId ? 'Editar restaurante' : 'Nueva entrada'}
      backLabel={restaurantId ? 'Volver' : 'Inicio'}
      onBack={goBack}
      avoidKeyboard
    >
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}
      >
        <RestaurantForm
          value={form}
          onChange={update}
          onSave={save}
          visitOnly={visitOnly}
          opinionMinHeight={visitOnly ? Math.max(0, viewportHeight - 40) : undefined}
          onOpinionLayout={setOpinionY}
          legacyPrice={legacyPrice}
        />
      </ScrollView>
    </ScreenLayout>
  );
};
