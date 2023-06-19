package org.univaq.swa.template.exceptions;

import com.fasterxml.jackson.databind.JsonMappingException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 *
 * @author didattica
 */
@Provider
public class JacksonExceptionMapper implements ExceptionMapper<JsonMappingException> {

    @Override
    public Response toResponse(JsonMappingException exception) {
        //utile per catturare tutte le eccezioni derivanti dalla serializzazione/deserializzazione automatica di oggetti
        System.err.println("Invalid JSON: "+exception.getMessage());
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Invalid JSON").build();
    }
}
