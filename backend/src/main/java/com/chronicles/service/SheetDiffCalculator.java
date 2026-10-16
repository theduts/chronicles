package com.chronicles.service;

import com.chronicles.domain.jsonb.CharacterSheet;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/**
 * Calcula o delta estruturado entre duas fichas no formato {@code {campo: {last, new}}}.
 * Objetos são comparados recursivamente; listas de objetos com {@code name}/{@code group} único são
 * comparadas por nome (ex.: perícias); demais listas são comparadas por inteiro.
 */
@Component
@RequiredArgsConstructor
public class SheetDiffCalculator {

    private final ObjectMapper objectMapper;

    public ObjectNode diff(CharacterSheet last, CharacterSheet proposed) {
        JsonNode lastNode = last == null ? objectMapper.createObjectNode() : objectMapper.valueToTree(last);
        JsonNode newNode = proposed == null ? objectMapper.createObjectNode() : objectMapper.valueToTree(proposed);
        return diffObjects(lastNode, newNode);
    }

    private ObjectNode diffObjects(JsonNode last, JsonNode proposed) {
        ObjectNode result = objectMapper.createObjectNode();
        Set<String> keys = new LinkedHashSet<>();
        last.fieldNames().forEachRemaining(keys::add);
        proposed.fieldNames().forEachRemaining(keys::add);

        for (String key : keys) {
            JsonNode d = diffValues(last.get(key), proposed.get(key));
            if (d != null) {
                result.set(key, d);
            }
        }
        return result;
    }

    /** Retorna null quando não há diferença. */
    private JsonNode diffValues(JsonNode l, JsonNode n) {
        boolean lMissing = l == null || l.isNull();
        boolean nMissing = n == null || n.isNull();
        if (lMissing && nMissing) return null;
        if (!lMissing && !nMissing && l.equals(n)) return null;

        if (!lMissing && !nMissing && l.isObject() && n.isObject()) {
            ObjectNode nested = diffObjects(l, n);
            return nested.isEmpty() ? null : nested;
        }
        if (!lMissing && !nMissing && isNamedList(l) && isNamedList(n)) {
            ObjectNode nested = diffNamedLists(l, n);
            return nested.isEmpty() ? null : nested;
        }
        ObjectNode leaf = objectMapper.createObjectNode();
        leaf.set("last", lMissing ? objectMapper.nullNode() : l);
        leaf.set("new", nMissing ? objectMapper.nullNode() : n);
        return leaf;
    }

    private ObjectNode diffNamedLists(JsonNode last, JsonNode proposed) {
        Map<String, JsonNode> lastByName = byName(last);
        Map<String, JsonNode> newByName = byName(proposed);
        Set<String> names = new LinkedHashSet<>(lastByName.keySet());
        names.addAll(newByName.keySet());

        ObjectNode result = objectMapper.createObjectNode();
        for (String name : names) {
            JsonNode d = diffValues(lastByName.get(name), newByName.get(name));
            if (d != null) {
                result.set(name, d);
            }
        }
        return result;
    }

    private boolean isNamedList(JsonNode node) {
        if (!(node instanceof ArrayNode array) || array.isEmpty()) return false;
        Set<String> seen = new HashSet<>();
        for (JsonNode el : array) {
            String key = keyOf(el);
            if (key == null || !seen.add(key)) return false;
        }
        return true;
    }

    private Map<String, JsonNode> byName(JsonNode array) {
        Map<String, JsonNode> map = new LinkedHashMap<>();
        array.forEach(el -> map.put(keyOf(el), el));
        return map;
    }

    /** Identificador de um item de lista: "name" (genérico) ou "group" (perícias). */
    private String keyOf(JsonNode el) {
        if (!el.isObject()) return null;
        for (String field : new String[]{"name", "group"}) {
            if (el.path(field).isTextual()) return el.get(field).asText();
        }
        return null;
    }
}
