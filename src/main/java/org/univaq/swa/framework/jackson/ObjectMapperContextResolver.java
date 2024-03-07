
package org.univaq.swa.framework.jackson;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.Calendar;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

/**
 *
 * @author didattica
 */
@Provider
public class ObjectMapperContextResolver implements ContextResolver<ObjectMapper> {

    private final ObjectMapper mapper;

    public ObjectMapperContextResolver() {
        this.mapper = createObjectMapper();
    }

    @Override
    public ObjectMapper getContext(Class<?> type) {
        return mapper;
    }

     private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        //abilitiamo una feature nuova...
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        SimpleModule customSerializer = new SimpleModule("CustomSerializersModule");

        //configuriamo i nostri serializzatori custom
        customSerializer.addSerializer(Calendar.class, new JavaCalendarSerializer());
        customSerializer.addDeserializer(Calendar.class, new JavaCalendarDeserializer());
        //       
        mapper.registerModule(customSerializer);

        //per il supporto alla serializzazione automatica dei tipi Date/Time di Java 8 (LocalDate, LocalTime, ecc.)
        //è necessario aggiungere alle dipendenze la libreria com.fasterxml.jackson.datatype:jackson-datatype-jsr310
        //questa feature fa cercare a Jackson tutti i moduli compatibili inseriti nel contesto...
        mapper.findAndRegisterModules();

        return mapper;
    }
}
