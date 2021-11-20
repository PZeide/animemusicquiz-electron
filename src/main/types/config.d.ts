type ConfigSchema = ConfigSchemaCategory[]

interface ConfigSchemaCategory {
    name: string;
    config: ConfigSchemaElement<any>[];
}

interface ConfigSchemaElement<T> {
    id: string;
    label: string;
    description: string;
    min?: number;
    max?: number;
    value: () => T;
    onChange: (value: T) => boolean;
    render?: (configElement: ConfigSchemaElement<T>, container: JQuery, defaultValue: T)  => void;
}