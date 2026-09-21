import { AppText } from '@/components';
import { Pressable, ScrollView, View } from 'react-native';
import { useFiltersStyles } from '../../filters.styles';
import type { TypesFilterProps } from './typesFilter.types';

export const TypesFilter = ({
  types,
  typesOpen,
  availableTypes,
  typesError,
  reloadTypes,
  updateFiltersValue,
  updateFiltersOpen,
}: TypesFilterProps) => {
  const styles = useFiltersStyles();
  return <>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Filtrar por tipos de comida"
      accessibilityState={{ expanded: typesOpen }}
      style={styles.dropdownTrigger}
      onPress={() => {
        updateFiltersOpen({ key: 'typesOpen', value: !typesOpen });
      }}
    >
      <AppText
        style={styles.dropdownLabel}
        text={
          types.length
            ? 'Tipos de comida (' + types.length + ')'
            : 'Todos los tipos de comida'
        }
      />
      <AppText style={styles.dropdownLabel} text={typesOpen ? '▴' : '▾'} />
    </Pressable>
    {typesOpen ? (
      <View style={styles.dropdown}>
        {typesError ? (
          <Pressable accessibilityRole="button" onPress={reloadTypes}>
            <AppText text={typesError} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => updateFiltersValue({ key: 'types', value: [] })}
          style={styles.option}
        >
          <AppText style={styles.dropdownLabel} text="Limpiar selección · Mostrar todos" />
        </Pressable>
        <ScrollView
          style={styles.options}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {availableTypes.map((type) => {
            const selected = types.includes(type);
            return (
              <Pressable
                key={type}
                accessibilityRole="checkbox"
                accessibilityLabel={type}
                accessibilityState={{ checked: selected }}
                style={styles.option}
                onPress={() =>
                  updateFiltersValue({
                    key: 'types',
                    value: selected ? types.filter((item) => item !== type) : [...types, type],
                  })
                }
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  <AppText style={styles.checkmark} text={selected ? '✓' : ''} />
                </View>
                <AppText style={styles.dropdownLabel} text={type} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    ) : null}
  </>;
};
